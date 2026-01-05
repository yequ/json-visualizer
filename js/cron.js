document.addEventListener('DOMContentLoaded', function() {
    initCheckboxes();
    updateCron();
});

function switchTab(tab) {
    // Update tab styles
    document.querySelectorAll('.cron-tab').forEach(el => {
        el.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update content visibility
    document.querySelectorAll('.cron-content').forEach(el => {
        el.classList.remove('active');
    });
    document.getElementById('tab-' + tab).classList.add('active');
}

function initCheckboxes() {
    createCheckboxes('second', 0, 59);
    createCheckboxes('minute', 0, 59);
    createCheckboxes('hour', 0, 23);
    createCheckboxes('day', 1, 31);
    createCheckboxes('month', 1, 12);
    
    // Week is special (1-7 or SUN-SAT)
    const weekMap = {1: '周日', 2: '周一', 3: '周二', 4: '周三', 5: '周四', 6: '周五', 7: '周六'};
    const container = document.getElementById('week-checkboxes');
    for (let i = 1; i <= 7; i++) {
        const div = document.createElement('div');
        div.innerHTML = `<input type="checkbox" value="${i}" onchange="onCheckboxChange('week')"> ${weekMap[i]}`;
        container.appendChild(div);
    }
}

function createCheckboxes(type, min, max) {
    const container = document.getElementById(type + '-checkboxes');
    for (let i = min; i <= max; i++) {
        const div = document.createElement('div');
        // Pad with zero if needed for display, but value is number
        const display = i < 10 ? '0' + i : i;
        div.innerHTML = `<input type="checkbox" value="${i}" onchange="onCheckboxChange('${type}')"> ${display}`;
        container.appendChild(div);
    }
}

function onCheckboxChange(type) {
    const radio = document.querySelector(`input[name="${type}"][value="specific"]`);
    if (radio) {
        radio.checked = true;
    }
    updateCron();
}

function onInputTypeChange(type, valueType) {
    const radio = document.querySelector(`input[name="${type}"][value="${valueType}"]`);
    if (radio) {
        radio.checked = true;
    }
    updateCron();
}

function handleExpressionInput() {
    const input = document.getElementById('cron-expression');
    const cron = input.value.trim();
    
    // Try to parse and update UI
    parseCronToUI(cron);
    
    // Calculate next runs regardless of UI update success
    calculateNextRuns(cron);
}

function parseCronToUI(cron) {
    const fields = cron.split(/\s+/);
    if (fields.length !== 6 && fields.length !== 5) return;

    let secondExp, minuteExp, hourExp, dayExp, monthExp, weekExp;

    if (fields.length === 6) {
        [secondExp, minuteExp, hourExp, dayExp, monthExp, weekExp] = fields;
    } else {
        secondExp = '0';
        [minuteExp, hourExp, dayExp, monthExp, weekExp] = fields;
    }

    setFieldFromExpression('second', secondExp);
    setFieldFromExpression('minute', minuteExp);
    setFieldFromExpression('hour', hourExp);
    setFieldFromExpression('day', dayExp);
    setFieldFromExpression('month', monthExp);
    setFieldFromExpression('week', weekExp);
}

function setFieldFromExpression(type, exp) {
    // Reset checkboxes
    const checkboxes = document.querySelectorAll(`#${type}-checkboxes input`);
    checkboxes.forEach(cb => cb.checked = false);

    let radioValue = 'specific'; // Default fallback

    if (exp === '*') {
        radioValue = '*';
    } else if (exp === '?') {
        radioValue = '?';
    } else if (exp.includes('-')) {
        radioValue = 'range';
        const [start, end] = exp.split('-');
        const startInput = document.getElementById(`${type}-start`);
        const endInput = document.getElementById(`${type}-end`);
        if (startInput && endInput) {
            startInput.value = start;
            endInput.value = end;
        }
    } else if (exp.includes('/')) {
        radioValue = 'interval';
        const [from, step] = exp.split('/');
        const fromInput = document.getElementById(`${type}-from`);
        const stepInput = document.getElementById(`${type}-step`);
        if (fromInput && stepInput) {
            fromInput.value = from;
            stepInput.value = step;
        }
    } else {
        // Specific values
        radioValue = 'specific';
        const values = exp.split(',');
        values.forEach(val => {
            const cb = document.querySelector(`#${type}-checkboxes input[value="${val}"]`);
            if (cb) cb.checked = true;
        });
    }

    const radio = document.querySelector(`input[name="${type}"][value="${radioValue}"]`);
    if (radio) radio.checked = true;
}

function updateCron() {
    const second = getFieldExpression('second');
    const minute = getFieldExpression('minute');
    const hour = getFieldExpression('hour');
    const day = getFieldExpression('day');
    const month = getFieldExpression('month');
    const week = getFieldExpression('week');

    const cron = `${second} ${minute} ${hour} ${day} ${month} ${week}`;
    
    // Only update input if it's not focused (to avoid fighting with user typing)
    const input = document.getElementById('cron-expression');
    if (document.activeElement !== input) {
        input.value = cron;
    }
    
    calculateNextRuns(cron);
}

function getFieldExpression(type) {
    const radios = document.getElementsByName(type);
    let selectedValue;
    for (const radio of radios) {
        if (radio.checked) {
            selectedValue = radio.value;
            break;
        }
    }

    if (selectedValue === '*' || selectedValue === '?') {
        return selectedValue;
    }

    if (selectedValue === 'range') {
        const start = document.getElementById(`${type}-start`).value;
        const end = document.getElementById(`${type}-end`).value;
        return `${start}-${end}`;
    }

    if (selectedValue === 'interval') {
        const from = document.getElementById(`${type}-from`).value;
        const step = document.getElementById(`${type}-step`).value;
        return `${from}/${step}`;
    }

    if (selectedValue === 'specific') {
        const checkboxes = document.querySelectorAll(`#${type}-checkboxes input:checked`);
        if (checkboxes.length === 0) return '*'; // Fallback
        const values = Array.from(checkboxes).map(cb => cb.value).join(',');
        return values;
    }

    return '*';
}

function copyCron() {
    const text = document.getElementById('cron-expression').value;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('.copy-output-btn');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6L9 17l-5-5"></path>
            </svg>
            <span>已复制</span>
        `;
        setTimeout(() => {
            btn.innerHTML = originalHtml;
        }, 2000);
    });
}

// Simple next run calculator (Client-side approximation)
function calculateNextRuns(cron) {
    const list = document.getElementById('next-runs-list');
    list.innerHTML = '<li>计算中...</li>';
    
    try {
        // Use setTimeout to avoid blocking UI thread for complex calculations
        setTimeout(() => {
            const dates = getNextRunTimes(cron, 5);
            if (dates.length === 0) {
                list.innerHTML = '<li>无法计算下次运行时间，请检查表达式是否有效。</li>';
                return;
            }
            
            list.innerHTML = '';
            dates.forEach(date => {
                const li = document.createElement('li');
                li.textContent = formatDate(date);
                list.appendChild(li);
            });
        }, 10);
    } catch (e) {
        console.error(e);
        list.innerHTML = '<li>计算出错: ' + e.message + '</li>';
    }
}

function formatDate(date) {
    const pad = (n) => n < 10 ? '0' + n : n;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function getNextRunTimes(cron, count) {
    if (!cron) return [];
    const fields = cron.trim().split(/\s+/);
    let secondExp, minuteExp, hourExp, dayExp, monthExp, weekExp;

    if (fields.length === 6) {
        secondExp = fields[0];
        minuteExp = fields[1];
        hourExp = fields[2];
        dayExp = fields[3];
        monthExp = fields[4];
        weekExp = fields[5];
    } else if (fields.length === 5) {
        secondExp = '0';
        minuteExp = fields[0];
        hourExp = fields[1];
        dayExp = fields[2];
        monthExp = fields[3];
        weekExp = fields[4];
    } else {
        return [];
    }
    
    const now = new Date();
    let current = new Date(now.getTime());
    current.setMilliseconds(0);
    // Start checking from current second + 1
    current.setSeconds(current.getSeconds() + 1);
    
    const results = [];
    let iterations = 0;
    const maxIterations = 20000; // Safety break
    
    while (results.length < count && iterations < maxIterations) {
        iterations++;
        
        // Check Month
        if (!matchField(monthExp, current.getMonth() + 1)) {
            current.setMonth(current.getMonth() + 1);
            current.setDate(1);
            current.setHours(0);
            current.setMinutes(0);
            current.setSeconds(0);
            continue;
        }
        
        // Check Day and Week
        const dayMatch = matchField(dayExp, current.getDate());
        // JS getDay: 0=Sun, 1=Mon... 6=Sat.
        // Our UI: 1=Sun, 2=Mon... 7=Sat.
        const currentWeekCronValue = current.getDay() + 1;
        
        const isDayGeneric = (dayExp === '*' || dayExp === '?');
        const isWeekGeneric = (weekExp === '*' || weekExp === '?');
        
        let dateMatches = false;
        if (isDayGeneric && isWeekGeneric) {
            dateMatches = true;
        } else if (!isDayGeneric && isWeekGeneric) {
            dateMatches = matchField(dayExp, current.getDate());
        } else if (isDayGeneric && !isWeekGeneric) {
            dateMatches = matchField(weekExp, currentWeekCronValue);
        } else {
            // Both specific: OR logic (standard Linux cron)
            dateMatches = matchField(dayExp, current.getDate()) || matchField(weekExp, currentWeekCronValue);
        }
        
        if (!dateMatches) {
            current.setDate(current.getDate() + 1);
            current.setHours(0);
            current.setMinutes(0);
            current.setSeconds(0);
            continue;
        }
        
        // Check Hour
        if (!matchField(hourExp, current.getHours())) {
            current.setHours(current.getHours() + 1);
            current.setMinutes(0);
            current.setSeconds(0);
            continue;
        }
        
        // Check Minute
        if (!matchField(minuteExp, current.getMinutes())) {
            current.setMinutes(current.getMinutes() + 1);
            current.setSeconds(0);
            continue;
        }

        // Check Second
        if (!matchField(secondExp, current.getSeconds())) {
            current.setSeconds(current.getSeconds() + 1);
            continue;
        }
        
        // Match found
        results.push(new Date(current.getTime()));
        current.setSeconds(current.getSeconds() + 1);
    }
    
    return results;
}

function matchField(expression, value) {
    if (expression === '*' || expression === '?') return true;
    
    const parts = expression.split(',');
    for (const part of parts) {
        // Handle step /
        if (part.includes('/')) {
            const [range, stepStr] = part.split('/');
            const step = Number(stepStr);
            let start, end;
            
            if (range === '*') {
                start = 0; 
            } else if (range.includes('-')) {
                 const [rStart, rEnd] = range.split('-').map(Number);
                 if (value < rStart || value > rEnd) continue;
                 start = rStart;
            } else {
                start = Number(range);
            }
            
            if (value >= start && (value - start) % step === 0) return true;
        }
        // Handle range -
        else if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            if (value >= start && value <= end) return true;
        }
        // Handle exact value
        else {
            if (Number(part) === value) return true;
        }
    }
    return false;
}