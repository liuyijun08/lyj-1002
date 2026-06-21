(function () {
    'use strict';

    const TEST_SCENARIOS = [
        {
            name: '接单按钮 (.accept-order-btn)',
            selector: '.accept-order-btn',
            testElementSelector: '#test-level-list .accept-order-btn'
        },
        {
            name: '订单卡片 (.order-card)',
            selector: '.order-card:not(.locked)',
            testElementSelector: '#test-level-list .order-card'
        },
        {
            name: '评价筛选 (.review-tab)',
            selector: '.review-tab',
            testElementSelector: '#test-review-tabs .review-tab'
        },
        {
            name: '库存分类 (.inv-tab)',
            selector: '.inv-tab',
            testElementSelector: '#test-inv-tabs .inv-tab'
        },
        {
            name: '称号 (.title-badge)',
            selector: '.title-badge.available, .title-badge.equipped',
            testElementSelector: '#test-titles-list .title-badge'
        },
        {
            name: '厨师值班 (.chef-assign-btn)',
            selector: '.chef-assign-btn',
            testElementSelector: '#test-chef-cards .chef-assign-btn'
        },
        {
            name: '厨师休息 (.chef-rest-btn)',
            selector: '.chef-rest-btn',
            testElementSelector: '#test-chef-cards .chef-rest-btn'
        }
    ];

    let bindAllCallCount = 0;
    const originalBindAll = EventManager.bindAll;

    function patchedBindAll() {
        bindAllCallCount++;
        originalBindAll();
        updateBindAllStat();
    }

    function updateBindAllStat() {
        const el = document.getElementById('stat-bindall-count');
        if (el) el.textContent = bindAllCallCount;
    }

    function findDelegatedBinding(selector) {
        const bindings = EventManager.DELEGATED_BINDINGS;
        for (let i = 0; i < bindings.length; i++) {
            if (bindings[i].selector === selector) {
                return bindings[i];
            }
        }
        return null;
    }

    function wrapHandlerWithCounter(binding) {
        const originalHandler = binding.handler;
        let callCount = 0;

        const wrapped = function (e, target) {
            callCount++;
            try {
                originalHandler(e, target);
            } catch (err) {
            }
        };

        wrapped._original = originalHandler;
        wrapped._getCount = function () { return callCount; };
        wrapped._resetCount = function () { callCount = 0; };

        binding.handler = wrapped;
        return wrapped;
    }

    function restoreOriginalHandler(binding) {
        if (binding.handler && binding.handler._original) {
            binding.handler = binding.handler._original;
        }
    }

    function triggerClick(el) {
        const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        el.dispatchEvent(event);
    }

    function runSingleTest() {
        const results = [];
        const wrappedBindings = [];

        try {
            TEST_SCENARIOS.forEach(scenario => {
                const binding = findDelegatedBinding(scenario.selector);
                if (!binding) {
                    results.push({
                        name: scenario.name,
                        passed: false,
                        expected: 1,
                        actual: 0,
                        error: '未找到对应的事件委托绑定'
                    });
                    return;
                }

                const wrapped = wrapHandlerWithCounter(binding);
                wrappedBindings.push({ binding, wrapped });

                const testEl = document.querySelector(scenario.testElementSelector);
                if (!testEl) {
                    results.push({
                        name: scenario.name,
                        passed: false,
                        expected: 1,
                        actual: 0,
                        error: '未找到测试元素'
                    });
                    return;
                }

                wrapped._resetCount();

                triggerClick(testEl);

                const count = wrapped._getCount();
                results.push({
                    name: scenario.name,
                    passed: count === 1,
                    expected: 1,
                    actual: count,
                    error: count === 1 ? null : `事件被触发了 ${count} 次，期望 1 次`
                });
            });
        } finally {
            wrappedBindings.forEach(item => {
                restoreOriginalHandler(item.binding);
            });
        }

        return results;
    }

    function renderResults(results, runNumber) {
        const container = document.getElementById('test-results');
        const summaryEl = document.getElementById('test-summary');

        const passed = results.filter(r => r.passed).length;
        const failed = results.filter(r => !r.passed).length;
        const total = results.length;

        document.getElementById('stat-total').textContent = total;
        document.getElementById('stat-pass').textContent = passed;
        document.getElementById('stat-fail').textContent = failed;

        const allPassed = failed === 0;
        summaryEl.style.display = 'block';
        summaryEl.className = 'test-summary ' + (allPassed ? 'pass' : 'fail');
        summaryEl.textContent = (runNumber ? `第 ${runNumber} 轮：` : '') +
            (allPassed ? `✅ 全部通过 (${passed}/${total})` : `❌ 测试失败 (${failed}/${total} 失败)`);

        let html = '';
        results.forEach(result => {
            const statusClass = result.passed ? 'pass' : 'fail';
            const statusIcon = result.passed ? '✅' : '❌';
            html += `<div class="test-case ${statusClass}">
                <h3>${statusIcon} ${result.name}</h3>
                <div class="test-detail">
                    期望触发次数：<span class="expected">${result.expected}</span>
                    &nbsp;&nbsp;|&nbsp;&nbsp;
                    实际触发次数：<span class="${result.passed ? 'expected' : 'actual'}">${result.actual}</span>
                </div>
                ${result.error ? `<div class="test-detail" style="color:#c0392b;">${result.error}</div>` : ''}
            </div>`;
        });

        container.innerHTML = html;
        return allPassed;
    }

    function runTests() {
        const btn = document.getElementById('btn-run-tests');
        const btn5x = document.getElementById('btn-run-tests-5x');
        btn.disabled = true;
        btn5x.disabled = true;

        try {
            patchedBindAll();
            patchedBindAll();
            patchedBindAll();

            const results = runSingleTest();
            renderResults(results, 0);

            return results;
        } finally {
            btn.disabled = false;
            btn5x.disabled = false;
        }
    }

    async function runTests5x() {
        const btn = document.getElementById('btn-run-tests');
        const btn5x = document.getElementById('btn-run-tests-5x');
        btn.disabled = true;
        btn5x.disabled = true;

        let allRoundsPassed = true;
        const container = document.getElementById('test-results');
        container.innerHTML = '<div style="padding:20px;text-align:center;color:#666;">正在运行 5 轮测试...</div>';

        try {
            for (let i = 1; i <= 5; i++) {
                patchedBindAll();
                patchedBindAll();

                await new Promise(resolve => setTimeout(resolve, 50));

                const results = runSingleTest();
                const roundPassed = results.every(r => r.passed);
                if (!roundPassed) allRoundsPassed = false;

                const passedCount = results.filter(r => r.passed).length;
                const totalCount = results.length;
                const roundStatus = roundPassed ? '✅ 通过' : '❌ 失败';

                let roundHtml = `<div class="test-case ${roundPassed ? 'pass' : 'fail'}">
                    <h3>第 ${i} 轮：${roundStatus} (${passedCount}/${totalCount})</h3>`;

                results.forEach(result => {
                    const statusIcon = result.passed ? '✅' : '❌';
                    roundHtml += `<div class="test-detail">
                        ${statusIcon} ${result.name}: ${result.actual} 次
                    </div>`;
                });

                roundHtml += '</div>';
                container.innerHTML += roundHtml;

                if (!roundPassed) break;
            }

            const summaryEl = document.getElementById('test-summary');
            summaryEl.style.display = 'block';
            summaryEl.className = 'test-summary ' + (allRoundsPassed ? 'pass' : 'fail');
            summaryEl.textContent = allRoundsPassed
                ? '🎉 5 轮测试全部通过！事件委托只触发一次'
                : '⚠️ 存在测试失败，请检查具体轮次详情';

        } finally {
            btn.disabled = false;
            btn5x.disabled = false;
        }
    }

    function init() {
        const btn = document.getElementById('btn-run-tests');
        const btn5x = document.getElementById('btn-run-tests-5x');

        if (btn) btn.addEventListener('click', runTests);
        if (btn5x) btn5x.addEventListener('click', runTests5x);

        updateBindAllStat();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
