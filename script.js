// 初始化数据
let gradesData = [];
let classData = [
    {
        id: 'default',
        name: '默认班级',
        description: '系统默认班级',
        creationDate: new Date().toISOString().slice(0, 10),
        studentCount: 0
    }
];
let currentView = 'subject';
let currentPanel = 'main';
let isDarkMode = false;
let colorScheme = 'default';
let animationsEnabled = true;

// DOM元素
const gradeForm = document.getElementById('grade-form');
const classSelect = document.getElementById('class-select');
const studentNameInput = document.getElementById('student-name');
const subjectSelect = document.getElementById('subject');
const scoreInput = document.getElementById('score');
const gradesList = document.getElementById('grades-list');
const demoDataBtn = document.getElementById('demo-data');
const viewButtons = document.querySelectorAll('.btn-view');
const chartTypeSelect = document.getElementById('chart-type');
const distributionTypeSelect = document.getElementById('distribution-type');
const trendSubjectSelect = document.getElementById('trend-subject');
const navButtons = document.querySelectorAll('.nav-btn');
const themeToggle = document.querySelector('.theme-toggle');
const exportDataBtn = document.getElementById('export-data');
const importDataInput = document.getElementById('import-data');
const searchInput = document.getElementById('search-input');
const filterSelect = document.getElementById('filter-select');
const advancedChartTypeSelect = document.getElementById('advanced-chart-type');

// 班级管理元素
const addClassBtn = document.getElementById('add-class');
const newClassNameInput = document.getElementById('new-class-name');
const classDescriptionInput = document.getElementById('class-description');
const classList = document.getElementById('class-list');
const compareBtn = document.getElementById('compare-btn');
const comparisonSubjectSelect = document.getElementById('comparison-subject');
const classCheckboxes = document.getElementById('class-checkboxes');

// 设置面板元素
const themeButtons = document.querySelectorAll('.theme-btn');
const colorButtons = document.querySelectorAll('.color-btn');
const animationToggle = document.getElementById('animation-toggle');
const autosaveToggle = document.getElementById('autosave-toggle');
const backupFrequencySelect = document.getElementById('backup-frequency');
const clearDataBtn = document.getElementById('clear-data');

// 成绩预测元素
const predictStudentSelect = document.getElementById('predict-student');
const predictSubjectSelect = document.getElementById('predict-subject');
const predictBtn = document.getElementById('predict-btn');
const learningSuggestions = document.getElementById('learning-suggestions');

// 图表实例
let gradesChart = null;
let distributionChart = null;
let trendChart = null;
let advancedChart = null;
let comparisonChart = null;
let predictionChart = null;

// 颜色设置
const chartColors = [
    'rgba(67, 97, 238, 0.7)',
    'rgba(76, 201, 240, 0.7)',
    'rgba(58, 180, 143, 0.7)',
    'rgba(246, 189, 96, 0.7)',
    'rgba(244, 129, 97, 0.7)',
    'rgba(242, 87, 87, 0.7)',
    'rgba(155, 89, 182, 0.7)',
    'rgba(52, 152, 219, 0.7)',
    'rgba(46, 204, 113, 0.7)'
];

// 科目最高分
const subjectMaxScores = {
    '语文': 150,
    '数学': 150,
    '英语': 150,
    '物理': 100,
    '化学': 100,
    '生物': 100,
    '历史': 100,
    '地理': 100,
    '政治': 100
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initEventListeners();
    initCharts();
    updateClassSelect();
    updateClassList();
    updatePredictStudentSelect();
    
    // 添加页面载入动画
    document.querySelectorAll('.animate__animated').forEach(element => {
        element.classList.add('animate__fadeIn');
    });
});

// 数据保存和加载
function saveData() {
    if (autosaveToggle && autosaveToggle.checked) {
        localStorage.setItem('gradesData', JSON.stringify(gradesData));
        localStorage.setItem('classData', JSON.stringify(classData));
        localStorage.setItem('settings', JSON.stringify({
            isDarkMode,
            colorScheme,
            animationsEnabled,
            backupFrequency: backupFrequencySelect ? backupFrequencySelect.value : 'weekly'
        }));
    }
}

function loadData() {
    try {
        const savedGradesData = localStorage.getItem('gradesData');
        const savedClassData = localStorage.getItem('classData');
        const savedSettings = localStorage.getItem('settings');
        
        if (savedGradesData) {
            gradesData = JSON.parse(savedGradesData);
        }
        
        if (savedClassData) {
            classData = JSON.parse(savedClassData);
        }
        
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            isDarkMode = settings.isDarkMode;
            colorScheme = settings.colorScheme;
            animationsEnabled = settings.animationsEnabled;
            
            if (isDarkMode) {
                document.body.classList.add('dark-mode');
                themeButtons.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-theme') === 'dark') {
                        btn.classList.add('active');
                    }
                });
            }
            
            if (colorScheme !== 'default') {
                document.body.classList.add(`color-scheme-${colorScheme}`);
                colorButtons.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-scheme') === colorScheme) {
                        btn.classList.add('active');
                    }
                });
            }
            
            if (animationToggle) {
                animationToggle.checked = animationsEnabled;
            }
            
            if (backupFrequencySelect && settings.backupFrequency) {
                backupFrequencySelect.value = settings.backupFrequency;
            }
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// 初始化事件监听器
function initEventListeners() {
    // 表单提交
    if (gradeForm) {
        gradeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addGrade();
        });
    }

    // 演示数据按钮
    if (demoDataBtn) {
        demoDataBtn.addEventListener('click', generateDemoData);
    }

    // 视图切换按钮
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentView = button.getAttribute('data-view');
            viewButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            updateGradesChart();
        });
    });
    
    // 图表类型选择
    if (chartTypeSelect) {
        chartTypeSelect.addEventListener('change', updateGradesChart);
    }
    
    // 分布图表类型选择
    if (distributionTypeSelect) {
        distributionTypeSelect.addEventListener('change', updateDistributionChart);
    }
    
    // 趋势科目选择
    if (trendSubjectSelect) {
        trendSubjectSelect.addEventListener('change', updateTrendChart);
    }
    
    // 高级图表类型选择
    if (advancedChartTypeSelect) {
        advancedChartTypeSelect.addEventListener('change', updateAdvancedChart);
    }
    
    // 导航面板切换
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const panelId = button.getAttribute('data-panel');
            switchPanel(panelId);
        });
    });
    
    // 主题切换
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleDarkMode);
    }
    
    // 主题按钮
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.getAttribute('data-theme');
            setTheme(theme);
            themeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    // 颜色方案按钮
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            const scheme = button.getAttribute('data-scheme');
            setColorScheme(scheme);
            colorButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    // 动画开关
    if (animationToggle) {
        animationToggle.addEventListener('change', () => {
            animationsEnabled = animationToggle.checked;
            saveData();
        });
    }
    
    // 自动保存开关
    if (autosaveToggle) {
        autosaveToggle.addEventListener('change', () => {
            if (autosaveToggle.checked) {
                saveData();
            }
        });
    }
    
    // 数据导出按钮
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportData);
    }
    
    // 数据导入
    if (importDataInput) {
        importDataInput.addEventListener('change', importData);
    }
    
    // 搜索和过滤
    if (searchInput) {
        searchInput.addEventListener('input', filterGradesList);
    }
    
    if (filterSelect) {
        filterSelect.addEventListener('change', filterGradesList);
    }
    
    // 班级添加按钮
    if (addClassBtn && newClassNameInput) {
        addClassBtn.addEventListener('click', addClass);
    }
    
    // 班级比较按钮
    if (compareBtn) {
        compareBtn.addEventListener('click', compareClasses);
    }
    
    // 成绩预测按钮
    if (predictBtn) {
        predictBtn.addEventListener('click', predictGrades);
    }
    
    // 数据清除按钮
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', () => {
            if (confirm('确定要清除所有数据吗？此操作不可撤销。')) {
                clearAllData();
            }
        });
    }
    
    // 科目变更时更新最高分
    if (subjectSelect) {
        subjectSelect.addEventListener('change', updateMaxScore);
    }
}

// 更新科目最高分提示
function updateMaxScore() {
    const subject = subjectSelect.value;
    const maxScore = subjectMaxScores[subject] || 100;
    
    scoreInput.max = maxScore;
    scoreInput.placeholder = `请输入分数 (0-${maxScore})`;
}

// 切换面板
function switchPanel(panelId) {
    currentPanel = panelId;
    
    // 更新导航按钮状态
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-panel') === panelId) {
            btn.classList.add('active');
        }
    });
    
    // 隐藏所有面板
    document.querySelectorAll('.panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // 显示当前面板
    const activePanel = document.getElementById(`${panelId}-panel`);
    if (activePanel) {
        activePanel.classList.add('active');
    }
    
    // 根据面板更新相关视图
    if (panelId === 'class-mgmt') {
        updateClassList();
        updateClassCheckboxes();
    } else if (panelId === 'predictions') {
        updatePredictStudentSelect();
    }
}

// 添加成绩
function addGrade() {
    const className = classSelect.value;
    const studentName = studentNameInput.value.trim();
    const subject = subjectSelect.value;
    const score = parseInt(scoreInput.value);
    const maxScore = subjectMaxScores[subject] || 100;

    if (!studentName || isNaN(score) || score < 0 || score > maxScore) {
        showNotification(`请输入有效的学生姓名和分数(0-${maxScore})`, 'error');
        return;
    }

    const newGrade = {
        id: Date.now(),
        className,
        studentName,
        subject,
        score,
        date: new Date().toISOString().slice(0, 10)
    };

    gradesData.push(newGrade);
    updateGradesList();
    updateAllCharts();
    updateClassStudentCount();
    resetForm();
    saveData();
    
    // 添加成功动画
    showNotification(`已添加 ${studentName} 的 ${subject} 成绩: ${score}分`, 'success');
}

// 重置表单
function resetForm() {
    studentNameInput.value = '';
    scoreInput.value = '';
    studentNameInput.focus();
}

// 更新成绩列表
function updateGradesList() {
    if (!gradesList) return;
    
    gradesList.innerHTML = '';
    
    // 过滤数据
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const filterSubject = filterSelect ? filterSelect.value : 'all';
    
    let filteredData = gradesData;
    
    if (searchTerm) {
        filteredData = filteredData.filter(grade => 
            grade.studentName.toLowerCase().includes(searchTerm) || 
            grade.className.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filterSubject !== 'all') {
        filteredData = filteredData.filter(grade => grade.subject === filterSubject);
    }
    
    if (filteredData.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="6" style="text-align: center;">暂无数据</td>';
        gradesList.appendChild(emptyRow);
        return;
    }

    filteredData.forEach((grade, index) => {
        const row = document.createElement('tr');
        row.classList.add('data-transition', 'data-enter');
        
        // 设置行的HTML内容
        row.innerHTML = `
            <td>${grade.className || '默认班级'}</td>
            <td>${grade.studentName}</td>
            <td>${grade.subject}</td>
            <td class="${getScoreClass(grade.score)}">${grade.score}</td>
            <td>${grade.date}</td>
            <td>
                <button class="delete-btn" data-id="${grade.id}">
                    <i class="fas fa-trash-alt">删除</i>
                </button>
            </td>
        `;
        
        gradesList.appendChild(row);
        
        // 触发进入动画
        if (animationsEnabled) {
            setTimeout(() => {
                row.classList.remove('data-enter');
                row.classList.add('data-enter-active');
            }, 50 * index);
        } else {
            row.classList.remove('data-enter');
            row.classList.add('data-enter-active');
        }
        
        // 添加删除按钮事件
        const deleteBtn = row.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteGrade(grade.id));
    });
}

// 过滤成绩列表
function filterGradesList() {
    updateGradesList();
}

// 删除成绩
function deleteGrade(id) {
    const index = gradesData.findIndex(grade => grade.id === id);
    if (index !== -1) {
        const deletedGrade = gradesData[index];
        gradesData.splice(index, 1);
        
        // 动画效果
        if (animationsEnabled) {
            const row = gradesList.querySelectorAll('tr')[index];
            row.classList.add('data-enter');
            row.classList.remove('data-enter-active');
            
            setTimeout(() => {
                updateGradesList();
                updateAllCharts();
                updateClassStudentCount();
                saveData();
                showNotification(`已删除 ${deletedGrade.studentName} 的 ${deletedGrade.subject} 成绩`, 'info');
            }, 300);
        } else {
            updateGradesList();
            updateAllCharts();
            updateClassStudentCount();
            saveData();
            showNotification(`已删除 ${deletedGrade.studentName} 的 ${deletedGrade.subject} 成绩`, 'info');
        }
    }
}

// 班级管理功能
function updateClassSelect() {
    if (!classSelect) return;
    
    // 清空之前选项
    classSelect.innerHTML = '';
    
    // 添加班级选项
    classData.forEach(classInfo => {
        const option = document.createElement('option');
        option.value = classInfo.name;
        option.textContent = classInfo.name;
        classSelect.appendChild(option);
    });
}

// 更新班级列表
function updateClassList() {
    if (!classList) return;
    
    classList.innerHTML = '';
    
    classData.forEach(classInfo => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${classInfo.name}</td>
            <td>${classInfo.studentCount || 0}</td>
            <td>${classInfo.creationDate}</td>
            <td>
                ${classInfo.name === '默认班级' ? 
                    '<span class="text-muted">系统默认</span>' : 
                    `<button class="delete-btn" data-id="${classInfo.id}"><i class="fas fa-trash-alt">删除</i></button>`
                }
            </td>
        `;
        
        classList.appendChild(row);
        
        // 不是默认班级才添加删除事件
        if (classInfo.name !== '默认班级') {
            const deleteBtn = row.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteClass(classInfo.id));
        }
    });
}

// 添加班级
function addClass() {
    const className = newClassNameInput.value.trim();
    const description = classDescriptionInput.value.trim();
    
    if (!className) {
        showNotification('请输入班级名称', 'error');
        return;
    }
    
    // 检查班级名称是否已存在
    if (classData.some(classInfo => classInfo.name === className)) {
        showNotification('班级名称已存在', 'error');
        return;
    }
    
    const newClass = {
        id: Date.now().toString(),
        name: className,
        description,
        creationDate: new Date().toISOString().slice(0, 10),
        studentCount: 0
    };
    
    classData.push(newClass);
    updateClassList();
    updateClassSelect();
    updateClassCheckboxes();
    saveData();
    
    // 清空表单
    newClassNameInput.value = '';
    classDescriptionInput.value = '';
    
    showNotification(`已创建班级: ${className}`, 'success');
}

// 删除班级
function deleteClass(id) {
    const classIndex = classData.findIndex(classInfo => classInfo.id === id);
    
    if (classIndex !== -1) {
        const className = classData[classIndex].name;
        
        // 确认对话框
        if (confirm(`确定要删除班级"${className}"吗？该班级的所有成绩数据都将转移到默认班级。`)) {
            // 将该班级的成绩转到默认班级
            gradesData.forEach(grade => {
                if (grade.className === className) {
                    grade.className = '默认班级';
                }
            });
            
            // 删除班级
            classData.splice(classIndex, 1);
            
            updateClassList();
            updateClassSelect();
            updateGradesList();
            updateAllCharts();
            updateClassCheckboxes();
            updateClassStudentCount();
            saveData();
            
            showNotification(`已删除班级: ${className}`, 'info');
        }
    }
}

// 更新班级学生数量
function updateClassStudentCount() {
    // 重置所有班级的学生计数
    classData.forEach(classInfo => {
        classInfo.studentCount = 0;
    });
    
    // 获取每个班级的唯一学生
    const classStudents = {};
    
    gradesData.forEach(grade => {
        const className = grade.className || '默认班级';
        
        if (!classStudents[className]) {
            classStudents[className] = new Set();
        }
        
        classStudents[className].add(grade.studentName);
    });
    
    // 更新每个班级的学生数量
    for (const className in classStudents) {
        const classInfo = classData.find(c => c.name === className);
        if (classInfo) {
            classInfo.studentCount = classStudents[className].size;
        }
    }
    
    updateClassList();
    saveData();
}

// 更新班级复选框
function updateClassCheckboxes() {
    if (!classCheckboxes) return;
    
    classCheckboxes.innerHTML = '';
    
    classData.forEach(classInfo => {
        const label = document.createElement('label');
        label.className = 'class-checkbox';
        
        label.innerHTML = `
            <input type="checkbox" value="${classInfo.name}">
            ${classInfo.name} (${classInfo.studentCount || 0}人)
        `;
        
        classCheckboxes.appendChild(label);
    });
}

// 比较班级
function compareClasses() {
    const checkboxes = classCheckboxes.querySelectorAll('input[type="checkbox"]:checked');
    const selectedClasses = Array.from(checkboxes).map(cb => cb.value);
    const subject = comparisonSubjectSelect.value;
    
    if (selectedClasses.length < 2) {
        showNotification('请至少选择两个班级进行对比', 'error');
        return;
    }
    
    initComparisonChart(selectedClasses, subject);
}

// 初始化班级对比图表
function initComparisonChart(selectedClasses, subject) {
    const comparisonCtx = document.getElementById('comparison-chart');
    if (!comparisonCtx) return;
    
    // 如果图表已存在，销毁它
    if (comparisonChart) {
        comparisonChart.destroy();
    }
    
    const datasets = [];
    const labels = ['优秀', '良好', '中等', '及格', '不及格'];
    
    // 为每个班级准备数据
    selectedClasses.forEach((className, index) => {
        // 获取该班级该科目的所有成绩
        let classGrades;
        
        if (subject === 'all') {
            classGrades = gradesData.filter(grade => grade.className === className);
        } else {
            classGrades = gradesData.filter(grade => 
                grade.className === className && grade.subject === subject
            );
        }
        
        // 如果没有数据，跳过
        if (classGrades.length === 0) {
            return;
        }
        
        // 计算分数分布
        const distribution = [0, 0, 0, 0, 0]; // 优秀、良好、中等、及格、不及格
        
        classGrades.forEach(grade => {
            const score = grade.score;
            const maxScore = subjectMaxScores[grade.subject] || 100;
            const percentage = (score / maxScore) * 100;
            
            if (percentage >= 90) {
                distribution[0]++;
            } else if (percentage >= 80) {
                distribution[1]++;
            } else if (percentage >= 70) {
                distribution[2]++;
            } else if (percentage >= 60) {
                distribution[3]++;
            } else {
                distribution[4]++;
            }
        });
        
        // 计算百分比
        const total = distribution.reduce((sum, val) => sum + val, 0);
        const percentages = distribution.map(val => (val / total * 100).toFixed(1));
        
        datasets.push({
            label: className,
            data: percentages,
            backgroundColor: chartColors[index % chartColors.length],
            borderColor: chartColors[index % chartColors.length].replace('0.7', '1'),
            borderWidth: 1
        });
    });
    
    // 创建图表
    comparisonChart = new Chart(comparisonCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: animationsEnabled ? 1000 : 0,
                easing: 'easeOutQuart'
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '百分比 (%)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: subject === 'all' ? '各班级成绩分布对比' : `各班级 ${subject} 成绩分布对比`,
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'top'
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 10,
                    cornerRadius: 5
                }
            }
        }
    });
}

// 导出数据
function exportData() {
    const exportData = {
        grades: gradesData,
        classes: classData,
        version: '1.0',
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileName = `学涯慧图数据导出_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    showNotification('数据导出成功', 'success');
}

// 导入数据
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            // 基本验证
            if (!importData.grades || !importData.classes || !Array.isArray(importData.grades) || !Array.isArray(importData.classes)) {
                throw new Error('无效的数据格式');
            }
            
            // 询问用户是替换还是合并
            const importMode = confirm('是否替换现有数据？\n- 点击"确定"将替换所有现有数据\n- 点击"取消"将合并导入数据和现有数据');
            
            if (importMode) {
                // 替换模式
                gradesData = importData.grades;
                classData = importData.classes;
            } else {
                // 合并模式 - 需要处理可能的ID冲突
                // 为导入的数据添加新ID
                importData.grades.forEach(grade => {
                    grade.id = Date.now() + Math.random().toString(36).substr(2, 9);
                });
                
                const existingClassNames = classData.map(c => c.name);
                const newClasses = importData.classes.filter(c => !existingClassNames.includes(c.name));
                
                gradesData = gradesData.concat(importData.grades);
                classData = classData.concat(newClasses);
            }
            
            // 更新UI
            updateGradesList();
            updateClassList();
            updateClassSelect();
            updateAllCharts();
            updateClassCheckboxes();
            updateClassStudentCount();
            updatePredictStudentSelect();
            saveData();
            
            showNotification('数据导入成功', 'success');
        } catch (error) {
            console.error('导入数据错误:', error);
            showNotification('导入失败: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
    
    // 重置输入框，以便可以重复导入同一个文件
    event.target.value = '';
}

// 清除所有数据
function clearAllData() {
    gradesData = [];
    classData = [
        {
            id: 'default',
            name: '默认班级',
            description: '系统默认班级',
            creationDate: new Date().toISOString().slice(0, 10),
            studentCount: 0
        }
    ];
    
    updateGradesList();
    updateClassList();
    updateClassSelect();
    updateAllCharts();
    updateClassCheckboxes();
    updatePredictStudentSelect();
    saveData();
    
    showNotification('所有数据已清除', 'info');
}

// 更新预测学生选择框
function updatePredictStudentSelect() {
    if (!predictStudentSelect) return;
    
    // 清空当前选项
    predictStudentSelect.innerHTML = '';
    
    // 获取所有唯一的学生名称
    const students = [...new Set(gradesData.map(grade => grade.studentName))];
    
    // 添加选项
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student;
        option.textContent = student;
        predictStudentSelect.appendChild(option);
    });
}

// 初始化图表
function initCharts() {
    // 成绩统计图表
    const gradesCtx = document.getElementById('grades-chart');
    if (gradesCtx) {
        gradesChart = new Chart(gradesCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: '平均分',
                    data: [],
                    backgroundColor: chartColors,
                    borderColor: chartColors.map(color => color.replace('0.7', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: animationsEnabled ? 1000 : 0,
                    easing: 'easeOutQuart'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        suggestedMax: 100
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        },
                        padding: 10,
                        cornerRadius: 5
                    }
                }
            }
        });
    }
    
    // 分布图表
    const distributionCtx = document.getElementById('distribution-chart');
    if (distributionCtx) {
        distributionChart = new Chart(distributionCtx, {
            type: 'pie',
            data: {
                labels: ['优秀 (90-100%)', '良好 (80-89%)', '中等 (70-79%)', '及格 (60-69%)', '不及格 (<60%)'],
                datasets: [{
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(76, 175, 80, 0.7)',
                        'rgba(33, 150, 243, 0.7)',
                        'rgba(255, 152, 0, 0.7)',
                        'rgba(255, 193, 7, 0.7)',
                        'rgba(244, 67, 54, 0.7)'
                    ],
                    borderColor: [
                        'rgba(76, 175, 80, 1)',
                        'rgba(33, 150, 243, 1)',
                        'rgba(255, 152, 0, 1)',
                        'rgba(255, 193, 7, 1)',
                        'rgba(244, 67, 54, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: animationsEnabled ? 1000 : 0,
                    easing: 'easeOutQuart'
                },
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        },
                        padding: 10,
                        cornerRadius: 5
                    }
                }
            }
        });
    }
    
    // 趋势图表
    const trendCtx = document.getElementById('trend-chart');
    if (trendCtx) {
        trendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: animationsEnabled ? 1000 : 0,
                    easing: 'easeOutQuart'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        suggestedMax: 100
                    }
                },
                elements: {
                    line: {
                        tension: 0.4
                    },
                    point: {
                        radius: 5,
                        hoverRadius: 7
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        },
                        padding: 10,
                        cornerRadius: 5
                    }
                }
            }
        });
    }
    
    // 高级分析图表
    const advancedCtx = document.getElementById('advanced-chart');
    if (advancedCtx) {
        advancedChart = new Chart(advancedCtx, {
            type: 'bubble',
            data: {
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: animationsEnabled ? 1000 : 0
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '科目数量'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '平均分'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.raw.name}: 平均分 ${context.raw.y.toFixed(1)}, ${context.raw.x} 个科目`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // 更新所有图表
    updateAllCharts();
}

// 更新所有图表
function updateAllCharts() {
    updateGradesChart();
    updateDistributionChart();
    updateTrendChart();
    updateAdvancedChart();
}

// 更新成绩统计图表
function updateGradesChart() {
    if (!gradesChart || gradesData.length === 0) {
        if (gradesChart) {
            gradesChart.data.labels = [];
            gradesChart.data.datasets[0].data = [];
            gradesChart.update();
        }
        return;
    }

    let labels = [];
    let data = [];
    let currentChartType = chartTypeSelect ? chartTypeSelect.value : 'bar';
    
    if (currentView === 'subject') {
        // 按科目统计
        const subjectData = {};
        const subjectCounts = {};
        
        gradesData.forEach(grade => {
            if (!subjectData[grade.subject]) {
                subjectData[grade.subject] = 0;
                subjectCounts[grade.subject] = 0;
            }
            subjectData[grade.subject] += grade.score;
            subjectCounts[grade.subject]++;
        });
        
        for (const subject in subjectData) {
            labels.push(subject);
            const avgScore = subjectData[subject] / subjectCounts[subject];
            data.push(avgScore.toFixed(1));
        }
        
        gradesChart.data.datasets[0].label = '各科目平均分';
        
    } else if (currentView === 'student') {
        // 按学生统计
        const studentData = {};
        const studentCounts = {};
        
        gradesData.forEach(grade => {
            if (!studentData[grade.studentName]) {
                studentData[grade.studentName] = 0;
                studentCounts[grade.studentName] = 0;
            }
            studentData[grade.studentName] += grade.score;
            studentCounts[grade.studentName]++;
        });
        
        for (const student in studentData) {
            labels.push(student);
            const avgScore = studentData[student] / studentCounts[student];
            data.push(avgScore.toFixed(1));
        }
        
        gradesChart.data.datasets[0].label = '各学生平均分';
        
    } else if (currentView === 'class') {
        // 按班级统计
        const classData = {};
        const classCounts = {};
        
        gradesData.forEach(grade => {
            const className = grade.className || '默认班级';
            if (!classData[className]) {
                classData[className] = 0;
                classCounts[className] = 0;
            }
            classData[className] += grade.score;
            classCounts[className]++;
        });
        
        for (const className in classData) {
            labels.push(className);
            const avgScore = classData[className] / classCounts[className];
            data.push(avgScore.toFixed(1));
        }
        
        gradesChart.data.datasets[0].label = '各班级平均分';
    }
    
    // 更改图表类型
    gradesChart.config.type = currentChartType;
    
    // 特定图表类型的特殊配置
    if (currentChartType === 'radar') {
        gradesChart.options.scales.r = {
            angleLines: {
                display: true
            },
            suggestedMin: 0,
            suggestedMax: 100
        };
        // 隐藏常规坐标轴
        gradesChart.options.scales.y.display = false;
    } else {
        // 恢复常规坐标轴
        gradesChart.options.scales.y.display = true;
        // 删除雷达图特有配置
        delete gradesChart.options.scales.r;
    }
    
    gradesChart.data.labels = labels;
    gradesChart.data.datasets[0].data = data;
    
    // 动画更新
    gradesChart.update();
}

// 更新分布图表
function updateDistributionChart() {
    if (!distributionChart || gradesData.length === 0) {
        if (distributionChart) {
            distributionChart.data.datasets[0].data = [0, 0, 0, 0, 0];
            distributionChart.update();
        }
        return;
    }
    
    const distribution = [0, 0, 0, 0, 0]; // 优秀、良好、中等、及格、不及格
    
    gradesData.forEach(grade => {
        const score = grade.score;
        const maxScore = subjectMaxScores[grade.subject] || 100;
        const percentage = (score / maxScore) * 100;
        
        if (percentage >= 90) {
            distribution[0]++;
        } else if (percentage >= 80) {
            distribution[1]++;
        } else if (percentage >= 70) {
            distribution[2]++;
        } else if (percentage >= 60) {
            distribution[3]++;
        } else {
            distribution[4]++;
        }
    });
    
    distributionChart.data.datasets[0].data = distribution;
    
    // 更新图表类型
    if (distributionTypeSelect) {
        distributionChart.config.type = distributionTypeSelect.value;
    }
    
    distributionChart.update();
}

// 更新趋势图表
function updateTrendChart() {
    if (!trendChart || gradesData.length === 0) {
        if (trendChart) {
            trendChart.data.labels = [];
            trendChart.data.datasets = [];
            trendChart.update();
        }
        return;
    }
    
    // 获取选中的科目
    const selectedSubject = trendSubjectSelect ? trendSubjectSelect.value : 'all';
    
    // 筛选数据
    let filteredData = gradesData;
    if (selectedSubject !== 'all') {
        filteredData = gradesData.filter(grade => grade.subject === selectedSubject);
    }
    
    // 获取所有不同的学生
    const students = [...new Set(filteredData.map(grade => grade.studentName))];
    
    // 获取所有唯一的日期并排序
    const dates = [...new Set(filteredData.map(grade => grade.date))].sort();
    
    // 为每个学生创建数据集
    const datasets = students.map((student, index) => {
        const studentData = [];
        
        dates.forEach(date => {
            // 计算该学生在此日期的平均分
            let dayGrades;
            if (selectedSubject === 'all') {
                dayGrades = filteredData.filter(g => g.studentName === student && g.date === date);
            } else {
                dayGrades = filteredData.filter(g => 
                    g.studentName === student && 
                    g.date === date && 
                    g.subject === selectedSubject
                );
            }
            
            if (dayGrades.length > 0) {
                const avgScore = dayGrades.reduce((sum, g) => sum + g.score, 0) / dayGrades.length;
                studentData.push(avgScore.toFixed(1));
            } else {
                studentData.push(null); // 无数据点
            }
        });
        
        return {
            label: student,
            data: studentData,
            borderColor: chartColors[index % chartColors.length],
            backgroundColor: chartColors[index % chartColors.length].replace('0.7', '0.1'),
            fill: false,
            borderWidth: 2,
            pointBackgroundColor: chartColors[index % chartColors.length].replace('0.7', '1')
        };
    });
    
    trendChart.data.labels = dates;
    trendChart.data.datasets = datasets;
    trendChart.update();
}

// 更新高级分析图表
function updateAdvancedChart() {
    if (!advancedChart || gradesData.length === 0) {
        if (advancedChart) {
            advancedChart.data.datasets = [];
            advancedChart.update();
        }
        return;
    }
    
    const chartType = advancedChartTypeSelect ? advancedChartTypeSelect.value : 'bubble';
    
    if (chartType === 'bubble') {
        // 气泡图 - 学生成绩分析
        const students = [...new Set(gradesData.map(grade => grade.studentName))];
        
        const bubbleData = students.map((student, index) => {
            const studentGrades = gradesData.filter(g => g.studentName === student);
            const subjects = [...new Set(studentGrades.map(g => g.subject))];
            const avgScore = studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length;
            
            return {
                label: student,
                data: [{
                    x: subjects.length,
                    y: avgScore,
                    r: Math.min(20, 5 + studentGrades.length / 2), // 气泡大小基于成绩数量
                    name: student
                }],
                backgroundColor: chartColors[index % chartColors.length]
            };
        });
        
        advancedChart.config.type = 'bubble';
        advancedChart.data.datasets = bubbleData;
        advancedChart.options.scales.x.title.text = '科目数量';
        advancedChart.options.scales.y.title.text = '平均分';
        
    } else if (chartType === 'scatter') {
        // 散点图 - 科目相关性分析
        advancedChart.config.type = 'scatter';
        
        const subjects = [...new Set(gradesData.map(grade => grade.subject))];
        if (subjects.length < 2) {
            advancedChart.data.datasets = [];
            advancedChart.update();
            return;
        }
        
        // 选择前两个主要科目进行相关性分析
        const mainSubjects = subjects.slice(0, 2);
        const students = [...new Set(gradesData.map(grade => grade.studentName))];
        
        const scatterData = [];
        
        students.forEach(student => {
            const subj1Grades = gradesData.filter(g => g.studentName === student && g.subject === mainSubjects[0]);
            const subj2Grades = gradesData.filter(g => g.studentName === student && g.subject === mainSubjects[1]);
            
            if (subj1Grades.length > 0 && subj2Grades.length > 0) {
                // 使用最新成绩
                const subj1Score = subj1Grades[subj1Grades.length - 1].score;
                const subj2Score = subj2Grades[subj2Grades.length - 1].score;
                
                scatterData.push({
                    x: subj1Score,
                    y: subj2Score,
                    name: student
                });
            }
        });
        
        advancedChart.data.datasets = [{
            label: `${mainSubjects[0]} vs ${mainSubjects[1]} 相关性`,
            data: scatterData,
            backgroundColor: chartColors[0],
            pointRadius: 8,
            pointHoverRadius: 10
        }];
        
        advancedChart.options.scales.x.title.text = mainSubjects[0];
        advancedChart.options.scales.y.title.text = mainSubjects[1];
        
    } else if (chartType === 'heatmap') {
        // 热力图 - 学生-科目成绩矩阵
        // 注意：由于Chart.js原生不支持热力图，这里使用一个变通方法
        
        advancedChart.config.type = 'scatter';
        
        const students = [...new Set(gradesData.map(grade => grade.studentName))];
        const subjects = [...new Set(gradesData.map(grade => grade.subject))];
        
        const heatmapData = [];
        const colors = [];
        
        students.forEach((student, yIndex) => {
            subjects.forEach((subject, xIndex) => {
                const subjGrades = gradesData.filter(g => g.studentName === student && g.subject === subject);
                
                if (subjGrades.length > 0) {
                    // 使用最新成绩
                    const score = subjGrades[subjGrades.length - 1].score;
                    const maxScore = subjectMaxScores[subject] || 100;
                    const percentage = score / maxScore;
                    
                    // 计算颜色 - 红（低分）到绿（高分）
                    let color;
                    if (percentage >= 0.9) {
                        color = 'rgba(76, 175, 80, 0.7)'; // 绿色 - 优秀
                    } else if (percentage >= 0.8) {
                        color = 'rgba(33, 150, 243, 0.7)'; // 蓝色 - 良好
                    } else if (percentage >= 0.7) {
                        color = 'rgba(255, 152, 0, 0.7)'; // 橙色 - 中等
                    } else if (percentage >= 0.6) {
                        color = 'rgba(255, 193, 7, 0.7)'; // 黄色 - 及格
                    } else {
                        color = 'rgba(244, 67, 54, 0.7)'; // 红色 - 不及格
                    }
                    
                    heatmapData.push({
                        x: xIndex,
                        y: yIndex,
                        v: score // 实际成绩值，用于显示
                    });
                    
                    colors.push(color);
                }
            });
        });
        
        advancedChart.data.datasets = [{
            data: heatmapData,
            backgroundColor: colors,
            pointRadius: 15,
            pointHoverRadius: 20
        }];
        
        // 自定义坐标轴刻度
        advancedChart.options.scales.x = {
            type: 'category',
            labels: subjects,
            title: {
                display: true,
                text: '科目'
            }
        };
        
        advancedChart.options.scales.y = {
            type: 'category',
            labels: students,
            title: {
                display: true,
                text: '学生'
            }
        };
        
        // 自定义工具提示
        advancedChart.options.plugins.tooltip = {
            callbacks: {
                label: function(context) {
                    const dataPoint = context.raw;
                    const student = students[dataPoint.y];
                    const subject = subjects[dataPoint.x];
                    return `${student} - ${subject}: ${dataPoint.v}分`;
                }
            }
        };
    }
    
    advancedChart.update();
}

// 生成演示数据
function generateDemoData() {
    // 清空现有数据
    gradesData = [];
    
    // 学生姓名列表
    const students = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];
    
    // 班级列表
    const classes = classData.map(c => c.name);
    
    // 科目列表
    const subjects = Object.keys(subjectMaxScores);
    
    // 日期列表（最近7天）
    const dates = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i * 5);
        dates.push(date.toISOString().slice(0, 10));
    }
    
    // 为每个学生生成不同科目的成绩
    students.forEach(student => {
        // 随机分配班级
        const className = classes[Math.floor(Math.random() * classes.length)];
        
        subjects.forEach(subject => {
            // 为每个学生的每个科目生成1-3条成绩记录
            const recordCount = Math.floor(Math.random() * 3) + 1;
            
            for (let i = 0; i < recordCount; i++) {
                // 随机选择一个日期
                const randomDateIndex = Math.floor(Math.random() * dates.length);
                const date = dates[randomDateIndex];
                
                // 获取该科目的最高分
                const maxScore = subjectMaxScores[subject];
                
                // 生成60%-100%之间的随机分数，偏向高分
                const minScore = Math.floor(maxScore * 0.6);
                const baseScore = Math.floor(Math.random() * (maxScore - minScore + 1)) + minScore;
                const randomAdjustment = Math.floor(Math.random() * (maxScore * 0.1)) - Math.floor(maxScore * 0.05); // -5%到5%的随机调整
                const score = Math.min(Math.max(baseScore + randomAdjustment, 0), maxScore);
                
                // 添加成绩记录
                gradesData.push({
                    id: Date.now() + gradesData.length,
                    className,
                    studentName: student,
                    subject: subject,
                    score: score,
                    date: date
                });
            }
        });
    });
    
    // 更新UI
    updateGradesList();
    updateAllCharts();
    updateClassStudentCount();
    updatePredictStudentSelect();
    saveData();
    showNotification('已生成演示数据', 'success');
}

// 根据分数获取CSS类
function getScoreClass(score) {
    // 获取科目
    let subject = null;
    const grade = gradesData.find(g => g.score === score);
    if (grade) {
        subject = grade.subject;
    }
    
    // 获取最高分
    const maxScore = subject ? (subjectMaxScores[subject] || 100) : 100;
    
    // 计算百分比
    const percentage = (score / maxScore) * 100;
    
    if (percentage >= 90) return 'excellent';
    if (percentage >= 80) return 'good';
    if (percentage >= 60) return 'average';
    return 'poor';
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 动画显示
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 3秒后移除
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 为通知创建样式
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 5px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    transform: translateX(120%);
    transition: transform 0.3s ease;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.notification.show {
    transform: translateX(0);
}

.notification.success {
    background-color: var(--success-color);
}

.notification.error {
    background-color: var(--danger-color);
}

.notification.info {
    background-color: var(--primary-color);
}
`;
document.head.appendChild(notificationStyle);

// 深色模式切换
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    saveData();
}

// 设置主题
function setTheme(theme) {
    if (theme === 'light') {
        document.body.classList.remove('dark-mode');
        isDarkMode = false;
    } else if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        isDarkMode = true;
    } else if (theme === 'auto') {
        // 跟随系统设置
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDarkMode) {
            document.body.classList.add('dark-mode');
            isDarkMode = true;
        } else {
            document.body.classList.remove('dark-mode');
            isDarkMode = false;
        }
    }
    
    saveData();
}

// 设置颜色方案
function setColorScheme(scheme) {
    // 移除当前颜色方案
    document.body.classList.remove('color-scheme-ocean', 'color-scheme-forest', 'color-scheme-sunset');
    
    // 添加新方案
    if (scheme !== 'default') {
        document.body.classList.add(`color-scheme-${scheme}`);
    }
    
    colorScheme = scheme;
    saveData();
}

// 预测成绩
function predictGrades() {
    const student = predictStudentSelect.value;
    const subject = predictSubjectSelect.value;
    
    if (!student) {
        showNotification('请选择学生', 'error');
        return;
    }
    
    const studentGrades = gradesData.filter(grade => 
        grade.studentName === student && 
        (subject === 'all' || grade.subject === subject)
    );
    
    if (studentGrades.length < 2) {
        showNotification('该学生历史成绩不足，无法预测', 'error');
        return;
    }
    
    // 初始化预测图表
    initPredictionChart(student, subject, studentGrades);
    
    // 生成学习建议
    generateLearningSuggestions(student, subject, studentGrades);
}

// 初始化预测图表
function initPredictionChart(student, subject, studentGrades) {
    const ctx = document.getElementById('prediction-chart');
    if (!ctx) return;
    
    // 如果已有图表，销毁它
    if (predictionChart) {
        predictionChart.destroy();
    }
    
    // 如果是所有科目，按科目分组展示
    if (subject === 'all') {
        const subjects = [...new Set(studentGrades.map(grade => grade.subject))];
        const datasets = [];
        
        // 为每个科目创建一个数据集
        subjects.forEach((subj, index) => {
            const subjGrades = studentGrades.filter(grade => grade.subject === subj)
                .sort((a, b) => new Date(a.date) - new Date(b.date));
            
            if (subjGrades.length < 2) return;
            
            // 现有数据点
            const dates = subjGrades.map(grade => grade.date);
            const scores = subjGrades.map(grade => grade.score);
            
            // 计算简单线性回归
            const regression = calculateRegression(scores);
            
            // 预测下一个数据点
            const nextDate = getNextDate(dates[dates.length - 1]);
            const predictedScore = Math.round(regression.slope * scores.length + regression.intercept);
            const maxScore = subjectMaxScores[subj] || 100;
            const clampedScore = Math.min(Math.max(predictedScore, 0), maxScore);
            
            dates.push(nextDate);
            scores.push(null); // 先添加一个空点，用于分隔实际和预测
            dates.push(nextDate);
            scores.push(clampedScore);
            
            datasets.push({
                label: subj,
                data: scores,
                borderColor: chartColors[index % chartColors.length],
                backgroundColor: chartColors[index % chartColors.length].replace('0.7', '0.1'),
                borderWidth: 2,
                fill: false,
                pointStyle: (ctx) => {
                    // 最后一个点使用特殊样式表示预测
                    if (ctx.dataIndex === scores.length - 1) {
                        return 'star';
                    }
                    return 'circle';
                },
                pointRadius: (ctx) => {
                    if (ctx.dataIndex === scores.length - 2) {
                        return 0; // 隐藏空点
                    }
                    if (ctx.dataIndex === scores.length - 1) {
                        return 8; // 预测点更大
                    }
                    return 5;
                },
                pointBackgroundColor: (ctx) => {
                    if (ctx.dataIndex === scores.length - 1) {
                        return chartColors[index % chartColors.length].replace('0.7', '1');
                    }
                    return chartColors[index % chartColors.length];
                },
                segment: {
                    borderDash: (ctx) => {
                        // 预测部分使用虚线
                        if (ctx.p1DataIndex === scores.length - 2) {
                            return [5, 5];
                        }
                        return undefined;
                    }
                }
            });
        });
        
        predictionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [...new Set(studentGrades.map(grade => grade.date))].sort((a, b) => new Date(a) - new Date(b)).concat(getNextDate()),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: animationsEnabled ? 1000 : 0
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: '分数'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '日期'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `${student} 的成绩预测`,
                        font: { size: 16 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const index = context.dataIndex;
                                const dataset = context.dataset;
                                if (index === dataset.data.length - 1) {
                                    return `${dataset.label} (预测): ${dataset.data[index]}分`;
                                }
                                return `${dataset.label}: ${dataset.data[index]}分`;
                            }
                        }
                    }
                }
            }
        });
    } else {
        // 单科目预测
        const subjGrades = studentGrades.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // 现有数据点
        const dates = subjGrades.map(grade => grade.date);
        const scores = subjGrades.map(grade => grade.score);
        
        // 计算简单线性回归
        const regression = calculateRegression(scores);
        
        // 预测未来几个数据点
        const predictDates = [];
        const predictScores = [];
        let lastDate = dates[dates.length - 1];
        
        for (let i = 1; i <= 3; i++) {
            lastDate = getNextDate(lastDate);
            predictDates.push(lastDate);
            
            const predictedScore = Math.round(regression.slope * (scores.length + i) + regression.intercept);
            const maxScore = subjectMaxScores[subject] || 100;
            const clampedScore = Math.min(Math.max(predictedScore, 0), maxScore);
            predictScores.push(clampedScore);
        }
        
        predictionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [...dates, ...predictDates],
                datasets: [
                    {
                        label: '实际成绩',
                        data: [...scores, ...Array(predictDates.length).fill(null)],
                        borderColor: chartColors[0],
                        backgroundColor: chartColors[0].replace('0.7', '0.1'),
                        fill: false,
                        borderWidth: 2,
                        pointBackgroundColor: chartColors[0].replace('0.7', '1')
                    },
                    {
                        label: '预测成绩',
                        data: [...Array(dates.length).fill(null), ...predictScores],
                        borderColor: chartColors[1],
                        backgroundColor: chartColors[1].replace('0.7', '0.1'),
                        fill: false,
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointStyle: 'star',
                        pointRadius: 8,
                        pointBackgroundColor: chartColors[1].replace('0.7', '1')
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: animationsEnabled ? 1000 : 0
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        suggestedMax: subjectMaxScores[subject] || 100,
                        title: {
                            display: true,
                            text: '分数'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '日期'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `${student} 的 ${subject} 成绩预测`,
                        font: { size: 16 }
                    }
                }
            }
        });
    }
}

// 计算简单线性回归
function calculateRegression(scores) {
    const n = scores.length;
    
    // X 值简单地取为数组索引
    const x = Array.from({ length: n }, (_, i) => i);
    const y = scores;
    
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    
    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumXX += x[i] * x[i];
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
}

// 获取下一个日期（默认+7天）
function getNextDate(date) {
    const currentDate = date ? new Date(date) : new Date();
    currentDate.setDate(currentDate.getDate() + 7);
    return currentDate.toISOString().slice(0, 10);
}

// 生成学习建议
function generateLearningSuggestions(student, subject, studentGrades) {
    if (!learningSuggestions) return;
    
    learningSuggestions.innerHTML = '';
    
    if (subject === 'all') {
        // 按科目分析
        const subjects = [...new Set(studentGrades.map(grade => grade.subject))];
        
        // 创建科目分析
        const subjectAnalysis = subjects.map(subj => {
            const subjGrades = studentGrades.filter(grade => grade.subject === subj)
                .sort((a, b) => new Date(a.date) - new Date(b.date));
            
            if (subjGrades.length < 2) return null;
            
            const scores = subjGrades.map(grade => grade.score);
            const maxScore = subjectMaxScores[subj] || 100;
            const latestScore = scores[scores.length - 1];
            const latestPercentage = (latestScore / maxScore) * 100;
            
            // 计算趋势
            const trend = scores[scores.length - 1] - scores[scores.length - 2];
            let trendText, trendClass;
            
            if (trend > 5) {
                trendText = '显著提升';
                trendClass = 'excellent';
            } else if (trend > 0) {
                trendText = '有所提升';
                trendClass = 'good';
            } else if (trend === 0) {
                trendText = '保持稳定';
                trendClass = 'average';
            } else if (trend > -5) {
                trendText = '略有下降';
                trendClass = 'average';
            } else {
                trendText = '明显下滑';
                trendClass = 'poor';
            }
            
            // 科目建议
            let suggestion;
            if (latestPercentage >= 90) {
                suggestion = `${subj}科目表现优秀，建议保持当前学习方法，可尝试拓展知识面，进一步提高学习效率。`;
            } else if (latestPercentage >= 80) {
                suggestion = `${subj}科目表现良好，可针对易错点进行专项训练，提高解题速度和准确率。`;
            } else if (latestPercentage >= 70) {
                suggestion = `${subj}科目有待提高，建议加强基础知识点的掌握，增加练习量，提高解题能力。`;
            } else if (latestPercentage >= 60) {
                suggestion = `${subj}科目需要加强，建议回归教材，系统梳理知识点，制定针对性的复习计划。`;
            } else {
                suggestion = `${subj}科目亟需改进，建议找出学习障碍点，调整学习方法，增加辅导时间，打好基础。`;
            }
            
            return {
                subject: subj,
                latestScore,
                maxScore,
                trend,
                trendText,
                trendClass,
                suggestion
            };
        }).filter(analysis => analysis !== null);
        
        // 渲染科目分析
        subjectAnalysis.forEach(analysis => {
            const analysisBox = document.createElement('div');
            analysisBox.className = 'subject-analysis';
            
            analysisBox.innerHTML = `
                <h5>${analysis.subject} <span class="latest-score ${getScoreClass(analysis.latestScore)}">${analysis.latestScore}/${analysis.maxScore}</span></h5>
                <p>近期趋势: <span class="${analysis.trendClass}">${analysis.trendText} (${analysis.trend > 0 ? '+' : ''}${analysis.trend}分)</span></p>
                <p>${analysis.suggestion}</p>
            `;
            
            learningSuggestions.appendChild(analysisBox);
        });
        
        // 总体建议
        const overallBox = document.createElement('div');
        overallBox.className = 'overall-analysis';
        
        // 计算综合情况
        const averageScores = subjectAnalysis.map(a => (a.latestScore / a.maxScore) * 100);
        const avgScore = averageScores.reduce((sum, score) => sum + score, 0) / averageScores.length;
        
        let overallSuggestion;
        if (avgScore >= 85) {
            overallSuggestion = `${student}同学表现优异，建议均衡发展各科目，培养综合能力，为更高目标做准备。`;
        } else if (avgScore >= 75) {
            overallSuggestion = `${student}同学整体表现良好，应注意保持学习习惯，加强薄弱学科，提高综合能力。`;
        } else if (avgScore >= 65) {
            overallSuggestion = `${student}同学有一定学习基础，建议合理规划学习时间，针对性加强薄弱科目，提高学习效率。`;
        } else {
            overallSuggestion = `${student}同学需要调整学习方法和心态，建议制定详细的学习计划，打好基础，循序渐进提高成绩。`;
        }
        
        overallBox.innerHTML = `
            <h4>总体学习建议</h4>
            <p>${overallSuggestion}</p>
        `;
        
        learningSuggestions.appendChild(overallBox);
    } else {
        // 单科目分析
        const subjGrades = studentGrades.sort((a, b) => new Date(a.date) - new Date(b));
        const scores = subjGrades.map(grade => grade.score);
        const dates = subjGrades.map(grade => grade.date);
        const maxScore = subjectMaxScores[subject] || 100;
        
        // 计算统计数据
        const latestScore = scores[scores.length - 1];
        const latestPercentage = (latestScore / maxScore) * 100;
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const maxScoreAchieved = Math.max(...scores);
        const minScoreAchieved = Math.min(...scores);
        
        // 计算趋势
        let trendDescription = '';
        if (scores.length >= 3) {
            const recentTrend = scores.slice(-3);
            if (recentTrend[2] > recentTrend[1] && recentTrend[1] > recentTrend[0]) {
                trendDescription = '持续上升';
            } else if (recentTrend[2] < recentTrend[1] && recentTrend[1] < recentTrend[0]) {
                trendDescription = '持续下降';
            } else if (recentTrend[2] > recentTrend[1]) {
                trendDescription = '最近有所提升';
            } else if (recentTrend[2] < recentTrend[1]) {
                trendDescription = '最近有所下降';
            } else {
                trendDescription = '保持稳定';
            }
        }
        
        // 分析
        const analysisBox = document.createElement('div');
        analysisBox.className = 'subject-detailed-analysis';
        
        let detailedSuggestion = '';
        
        if (latestPercentage >= 90) {
            detailedSuggestion = `
                <p><strong>优势:</strong> ${subject}学科已有很好的基础，概念理解清晰，解题能力强。</p>
                <p><strong>建议:</strong> 
                    <ul>
                        <li>关注解题速度和准确性，提高考试技巧</li>
                        <li>尝试更具挑战性的题目，拓展知识深度</li>
                        <li>帮助其他同学，通过教学加深自己的理解</li>
                        <li>提前学习更高难度的内容，为未来学习做准备</li>
                    </ul>
                </p>
            `;
        } else if (latestPercentage >= 80) {
            detailedSuggestion = `
                <p><strong>优势:</strong> ${subject}学科基础扎实，理解能力良好，有一定解题能力。</p>
                <p><strong>建议:</strong> 
                    <ul>
                        <li>分析错题，找出易错点和知识漏洞</li>
                        <li>加强解题技巧，尤其是难题的解决方法</li>
                        <li>提高学习效率，合理安排复习时间</li>
                        <li>多做综合性题目，提升知识融会贯通能力</li>
                    </ul>
                </p>
            `;
        } else if (latestPercentage >= 70) {
            detailedSuggestion = `
                <p><strong>情况:</strong> ${subject}学科掌握基本知识点，但在综合应用和难题解决方面有困难。</p>
                <p><strong>建议:</strong> 
                    <ul>
                        <li>梳理知识体系，建立知识框架</li>
                        <li>增加基础题型练习，强化解题方法</li>
                        <li>多做针对性练习，改进薄弱环节</li>
                        <li>寻求老师辅导，理清思路和方法</li>
                        <li>制定合理的学习计划，坚持每日复习</li>
                    </ul>
                </p>
            `;
        } else if (latestPercentage >= 60) {
            detailedSuggestion = `
                <p><strong>情况:</strong> ${subject}学科存在较多知识漏洞，基础概念理解不够透彻。</p>
                <p><strong>建议:</strong> 
                    <ul>
                        <li>回归教材，重新学习基础概念</li>
                        <li>从简单题目开始，逐步提高难度</li>
                        <li>建立错题本，反复练习薄弱点</li>
                        <li>增加学习时间，提高学习专注度</li>
                        <li>尝试小组学习，互相促进理解</li>
                        <li>可考虑个性化辅导，找出学习障碍</li>
                    </ul>
                </p>
            `;
        } else {
            detailedSuggestion = `
                <p><strong>情况:</strong> ${subject}学科基础较为薄弱，需要系统性提升。</p>
                <p><strong>建议:</strong> 
                    <ul>
                        <li>制定详细的补救学习计划</li>
                        <li>从最基础的知识点开始重新学习</li>
                        <li>每天固定时间专注于该学科</li>
                        <li>寻求老师或专业辅导的帮助</li>
                        <li>调整学习方法，找到适合自己的学习方式</li>
                        <li>设立小目标，逐步提升信心</li>
                        <li>加强学习交流，了解他人有效的学习策略</li>
                    </ul>
                </p>
            `;
        }
        
        analysisBox.innerHTML = `
            <h4>${student}的${subject}学科分析</h4>
            <div class="stats-grid">
                <div class="stat-box">
                    <span class="stat-label">最新成绩</span>
                    <span class="stat-value ${getScoreClass(latestScore)}">${latestScore}/${maxScore}</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">平均成绩</span>
                    <span class="stat-value">${avgScore.toFixed(1)}</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">最高成绩</span>
                    <span class="stat-value excellent">${maxScoreAchieved}</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">最低成绩</span>
                    <span class="stat-value ${getScoreClass(minScoreAchieved)}">${minScoreAchieved}</span>
                </div>
            </div>
            <p>成绩趋势: <strong>${trendDescription}</strong></p>
            <div class="learning-suggestions">
                <h5>个性化学习建议</h5>
                ${detailedSuggestion}
            </div>
        `;
        
        learningSuggestions.appendChild(analysisBox);
    }
} 