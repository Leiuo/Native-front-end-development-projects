// DOM 元素
const todoInput = document.getElementById('todoInput');
const addButton = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const todoCountSpan = document.getElementById('todoCount');
// const activeCountSpan = document.getElementById('activeCount');
const completedCountSpan = document.getElementById('completedCount');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

// 批量操作相关 DOM
const batchActions = document.getElementById('batchActions');
const selectedCountSpan = document.getElementById('selectedCount');
const selectAllBtn = document.getElementById('selectAllBtn');
const invertSelectBtn = document.getElementById('invertSelectBtn');
const batchCompleteBtn = document.getElementById('batchCompleteBtn');
const batchUncompleteBtn = document.getElementById('batchUncompleteBtn');
const batchDeleteBtn = document.getElementById('batchDeleteBtn');
const batchCancelBtn = document.getElementById('batchCancelBtn');

let todos = []; // 待办事项数组
let currentFilter = 'all'; // 当前过滤条件，默认为 "all"
let selectedTodos = new Set(); // 当前选中的待办事项

// 初始化加载数据
function loadTodos() {
    const storedTodos = JSON.parse(localStorage.getItem('todos')) || [];
    todos.push(...storedTodos);
    renderTodos();
}

// 保存数据到 localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// 添加待办事项
function addTodo() {
    const text = todoInput.value.trim();
    if (text) {
        // 检查是否有重复的待办事项
        if (todos.some(todo => todo.text === text)) {
            showToast('待办事项已存在', 'warning');
            todoInput.value = '';
            todoInput.focus();
            return;
        }

        todos.push({ id: Date.now(), text, completed: false, createdAt: new Date() });
        saveTodos();
        todoInput.value = '';
        todoInput.focus();
        showToast('待办事项添加成功', 'success');
        renderTodos();
    } else {
        showToast('请输入待办事项内容', 'error');
        todoInput.focus();
        return;
    }
}

// 删除待办事项
function deleteTodo(id) {
    const index = todos.findIndex(todo => todo.id === id); // 查找待办事项的索引

    // 如果找到了待办事项，则删除它
    if (index !== -1 && confirm('你确定要删除这个待办事项吗？')) {
        todos.splice(index, 1);
        saveTodos();
        showToast('待办事项删除成功', 'success');
        renderTodos();
    }
}

// 切换待办事项完成状态
function toggleTodo(id) {
    const todo = todos.find(todo => todo.id === id); // 查找对应 ID 的待办事项
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();

        const status = todo.completed ? '已完成' : '未完成'; // 根据完成状态设置提示信息
        showToast(`待办事项标记为${status}`, 'info');
        renderTodos();
    }
}

// 编辑待办事项
function editTodo(id, newText) {
    const todo = todos.find(todo => todo.id === id); // 查找对应 ID 的待办事项
    if (todo && newText.trim()) { // 如果找到了待办事项，并且新文本不为空，则更新待办事项的文本
        todo.text = newText.trim();
        saveTodos();
        // showToast('待办事项编辑成功', 'success');
        renderTodos(); // 重新渲染待办事项列表
        cancelEdit(id); // 取消编辑状态
    }
}

// 清除已完成的待办事项
function clearCompleted() {
    if (!todos.some(todo => todo.completed)) { // 如果没有已完成的待办事项，则显示提示信息
        showToast('没有已完成的待办事项可清除', 'info');
        return;
    } else { // 如果有已完成的待办事项，则询问用户是否确认清除，并执行清除操作
        if (confirm('你确定要清除所有已完成的待办事项吗？')) {
            const completedIds = todos.filter(todo => todo.completed).map(todo => todo.id); // 获取所有已完成的待办事项的 ID
            completedIds.forEach(id => selectedTodos.delete(id)); // 从选中列表中移除已完成的待办事项 ID

            todos = todos.filter(todo => !todo.completed); // 过滤掉已完成的待办事项
            saveTodos();
            showToast('已完成的待办事项已清除', 'success');
            updateBatchActionsVisibility(); // 更新批量操作按钮的显示状态
            renderTodos();

            // todos = todos.filter(todo => !todo.completed);
            // saveTodos();
            // showToast('已完成的待办事项已清除', 'success');
            // renderTodos();
        }
    }
}

/* ===== 批量操作函数 ===== */
// 切换全选/全不选状态
function toggleSelectAll() {
    const visibleTodos = getVisibleTodos(); // 获取当前可见的待办事项列表
    const allSelected = visibleTodos.length > 0 && visibleTodos.every(todo => selectedTodos.has(todo.id)); // 判断是否所有可见的待办事项都已被选中

    if (allSelected) { // 如果所有可见的待办事项都已被选中，则取消全选
        visibleTodos.forEach(todo => selectedTodos.delete(todo.id)); // 从选中列表中移除所有可见的待办事项 ID
        showToast('已取消全选', 'info');
    } else { // 如果不是所有可见的待办事项都已被选中，则执行全选
        visibleTodos.forEach(todo => selectedTodos.add(todo.id)); // 将所有可见的待办事项 ID 添加到选中列表中
        showToast('已全选', 'success');
    }

    updateBatchActionsVisibility(); // 更新批量操作按钮的显示状态
    renderTodos(); // 重新渲染待办事项列表，更新选中状态的显示
}

// 切换反选状态
function invertSelection() {
    const visibleTodos = getVisibleTodos(); // 获取当前可见的待办事项列表

    // 对每个可见的待办事项进行反选操作，如果当前待办事项已被选中，则取消选中；如果当前待办事项未被选中，则添加到选中列表中
    visibleTodos.forEach(todo => {
        if (selectedTodos.has(todo.id)) {
            selectedTodos.delete(todo.id);
        } else {
            selectedTodos.add(todo.id);
        }
    });

    const selectedCount = selectedTodos.size; // 获取当前选中的待办事项数量
    if (selectedCount === 0) {
        showToast('已取消所有选择', 'info');
    } else {
        showToast(`已反选，当前选中 ${selectedCount} 个待办事项`, 'info');
    }

    updateBatchActionsVisibility(); // 更新批量操作按钮的显示状态
    renderTodos(); // 重新渲染待办事项列表，更新选中状态的显示
}

// 批量标记为已完成
function batchComplete() {
    if (selectedTodos.size === 0) { // 如果没有选中的待办事项，则显示提示信息
        showToast('请先选择要标记为已完成的待办事项', 'warning');
        return;
    }

    let updatedCount = 0; // 记录成功更新的待办事项数量
    selectedTodos.forEach(id => {
        const todo = todos.find(todo => todo.id === id); // 查找对应 ID 的待办事项
        if (todo && !todo.completed) { // 如果找到了待办事项，并且它未完成，则标记为已完成
            todo.completed = true;
            updatedCount++;
        }
    });

    // 更新数据并显示提示信息
    if (updatedCount > 0) {
        saveTodos();
        showToast(`成功标记 ${updatedCount} 个待办事项为已完成`, 'success');
    } else {
        showToast('选中的待办事项已经全部是已完成状态', 'info');
    }

    updateBatchActionsVisibility(); // 更新批量操作按钮的显示状态
    renderTodos(); // 重新渲染待办事项列表，更新状态的显示
}

// 批量标记为未完成
function batchUncomplete() {
    if (selectedTodos.size === 0) { // 如果没有选中的待办事项，则显示提示信息
        showToast('请先选择要标记为未完成的待办事项', 'warning');
        return;
    }
    let updatedCount = 0; // 记录成功更新的待办事项数量
    selectedTodos.forEach(id => {
        const todo = todos.find(todo => todo.id === id); // 查找对应 ID 的待办事项
        if (todo && todo.completed) { // 如果找到了待办事项，并且它已完成，则标记为未完成
            todo.completed = false;
            updatedCount++;
        }
    });

    // 更新数据并显示提示信息
    if (updatedCount > 0) {
        saveTodos();
        showToast(`成功标记 ${updatedCount} 个待办事项为未完成`, 'success');
    } else {
        showToast('选中的待办事项已经全部是未完成状态', 'info');
    }

    updateBatchActionsVisibility(); // 更新批量操作按钮的显示状态
    renderTodos(); // 重新渲染待办事项列表，更新状态的显示
}

// 批量删除
function batchDelete() {
    if (selectedTodos.size === 0) { // 如果没有选中的待办事项，则显示提示信息
        showToast('请先选择要删除的待办事项', 'warning');
        return;
    }

    if (confirm(`你确定要删除选中的 ${selectedTodos.size} 个待办事项吗？`)) { // 询问用户是否确认删除，并执行删除操作
        todos = todos.filter(todo => !selectedTodos.has(todo.id)); // 过滤掉选中的待办事项
        selectedTodos.clear(); // 清空选中列表
        saveTodos();
        showToast(`成功删除 ${selectedTodos.size} 个待办事项`, 'success');

        updateBatchActionsVisibility(); // 更新批量操作按钮的显示状态
        renderTodos(); // 重新渲染待办事项列表，更新状态的显示
    }
}

// 取消批量操作
function clearSelection() {
    selectedTodos.clear(); // 清空选中列表
    updateBatchActionsVisibility(); // 更新批量操作按钮的显示状态
    renderTodos(); // 重新渲染待办事项列表，更新状态的显示
    showToast('已取消所有选择', 'info'); // 显示提示信息
}


// 渲染待办事项列表
function renderTodos() {
    let filteredTodos = todos; // 默认显示所有待办事项

    // 根据当前过滤条件过滤待办事项
    if (currentFilter === 'active') { // 如果当前过滤条件是 "active"，则只显示未完成的待办事项
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') { // 如果当前过滤条件是 "completed"，则只显示已完成的待办事项
        filteredTodos = todos.filter(todo => todo.completed);
    }

    // 更新统计信息
    const totalCount = todos.length;
    // const activeCount = todos.filter(todo => !todo.completed).length;
    const completedCount = todos.filter(todo => todo.completed).length;
    todoCountSpan.textContent = totalCount;
    // document.getElementById('activeCount').textContent = activeCount;
    completedCountSpan.textContent = completedCount;

    // 清空待办事项列表    
    todoList.innerHTML = '';

    // 显示空状态
    if (filteredTodos.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-state';
        emptyDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <p>
                ${currentFilter === 'all' ? '暂无待办事项，添加一个吧！' : currentFilter === 'active' ? '没有进行中的事项，休息一下！' : '还没有完成的事项，加油！'}
            </p>
        `; // 根据当前过滤条件显示不同的提示信息
        todoList.appendChild(emptyDiv);
        return;
    }

    // 渲染待办事项
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.setAttribute('data-id', todo.id); // 设置 data-id 属性，方便后续操作

        // 使用模板字符串构建待办事项的 HTML 结构，包含复选框、文本内容和操作按钮
        li.innerHTML = `
            <div class="todo-checkbox">
                <label>
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                        onchange="toggleTodo(${todo.id})">
                    <span class="checkbox-custom"></span>
                </label>
            </div>
            <div class="todo-content">
                <span class="todo-text ${todo.completed ? 'completed' : ''}" 
                      id="text-${todo.id}">${escapeHtml(todo.text)}</span>
                <input type="text" class="todo-edit-input" id="edit-${todo.id}"
                value="${escapeHtml(todo.text)}" style="display: none;">
                <div class="todo-actions">
                    <button class="edit-btn" onclick="startEdit(${todo.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteTodo(${todo.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <button class="save-btn" id="save-${todo.id}" 
                            onclick="saveEdit(${todo.id})" style="display: none;">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="cancel-btn" id="cancel-${todo.id}" 
                            onclick="cancelEdit(${todo.id})" style="display: none;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;

        todoList.appendChild(li); // 将构建好的待办事项元素添加到待办事项列表中
    });

}

// 转义 HTML 字符，防止 XSS 攻击
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, char => map[char]);
}

// 开始编辑待办事项
let currentEditingId = null; // 当前正在编辑的待办事项 ID
function startEdit(id) {
    // 如果已经有在编辑的项，先取消
    if (currentEditingId !== null && currentEditingId !== id) {
        cancelEdit(currentEditingId);
    }
    currentEditingId = id;

    const textSpan = document.getElementById(`text-${id}`);
    const editInput = document.getElementById(`edit-${id}`);
    const saveBtn = document.getElementById(`save-${id}`);
    const cancelBtn = document.getElementById(`cancel-${id}`);
    const editBtn = document.querySelector(`.edit-btn[onclick="startEdit(${id})"]`);
    const deleteBtn = document.querySelector(`.delete-btn[onclick="deleteTodo(${id})"]`);

    // 隐藏文本和编辑/删除按钮
    textSpan.style.display = 'none';
    editBtn.style.display = 'none';
    deleteBtn.style.display = 'none';

    // 显示输入框和保存/取消按钮
    editInput.style.display = 'block';
    saveBtn.style.display = 'block';
    cancelBtn.style.display = 'block';

    // 聚焦输入框
    editInput.focus();
    editInput.select(); // 选中输入框中的文本，方便用户直接修改

    // 监听输入框的 Enter 和 Escape 键
    editInput.addEventListener('keypress', function onKeyPress(e) {
        if (e.key === 'Enter') {
            saveEdit(id);
        } else if (e.key === 'Escape') {
            cancelEdit(id);
        }
    });

}

// 保存编辑后的待办事项
function saveEdit(id) {
    const editInput = document.getElementById(`edit-${id}`); // 获取输入框元素
    const newText = editInput.value.trim(); // 获取输入框中的新文本，并去除两端的空白字符

    if (newText) {
        const todo = todos.find(todo => todo.id === id); // 查找对应 ID 的待办事项
        if (todo) {
            // 检查是否有重复的待办事项（排除当前正在编辑的项）
            if (todos.some(t => t.text === newText && t.id !== id)) {
                showToast('待办事项已存在', 'warning');
                editInput.focus();
                return;
            }
            editTodo(id, newText); // 调用编辑函数，传入 ID 和新文本
            showToast('待办事项编辑成功', 'success');
            currentEditingId = null; // 重置当前编辑的 ID
        }
    } else {
        showToast('待办事项内容不能为空', 'warning');
        editInput.focus();
        return;
    }
}

// 取消编辑
function cancelEdit(id) {
    currentEditingId = null; // 重置当前编辑的 ID
    renderTodos(); // 重新渲染待办事项列表，恢复到编辑前的状态
}

// 切换过滤条件
function setFilter(filter) {
    currentFilter = filter; // 更新当前过滤条件

    // 更新过滤按钮的样式
    filterBtns.forEach(btn => {
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    selectedTodos.clear(); // 切换过滤条件时清空选中列表，避免选中状态与当前显示的待办事项不一致
    updateBatchActionsVisibility(); // 更新批量操作按钮的显示状态
    renderTodos(); // 重新渲染待办事项列表，根据新的过滤条件显示对应的待办事项
}

// 显示提示信息
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container'); // 获取提示信息容器

    if (!container) { // 如果容器不存在，则创建一个新的容器
        container = document.createElement('div'); // 创建一个新的 div 元素
        container.className = 'toast-container'; // 设置容器的类名
        document.body.appendChild(container); // 将容器添加到 body 中
    }

    const toast = document.createElement('div'); // 创建一个新的 div 元素
    toast.className = `toast toast-${type}`; // 设置 toast 的类名，根据 type 来设置不同的样式

    const icons = { // 定义不同类型的图标
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icons[type]}"></i>
        </div>  
        <div class="toast-message">${message}</div>
    `; // 设置 toast 的内容，包含图标和消息
    container.appendChild(toast); // 将 toast 添加到容器中

    // 设置一个定时器，在 3 秒后自动移除 toast
    setTimeout(() => {
        toast.classList.add('hide'); // 添加 hide 类，触发动画效果
        setTimeout(() => {
            toast.remove(); // 从 DOM 中移除 toast 元素
        }, 300); // 等待动画完成后再移除元素
    }, 3000);
}

// 更新批量操作按钮的显示状态
function updateBatchActionsVisibility() {
    if (selectedTodos.size > 0) { // 如果有选中的待办事项，则显示批量操作按钮
        batchActions.style.display = 'flex';
        selectedCountSpan.textContent = selectedTodos.size; // 更新选中数量的显示
    } else { // 如果没有选中的待办事项，则隐藏批量操作按钮
        batchActions.style.display = 'none';
    }
}

// 获取当前可见的待办事项列表
function getVisibleTodos() {
    if (currentFilter === 'active') { // 如果当前过滤条件是 "active"，则返回未完成的待办事项列表
        return todos.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') { // 如果当前过滤条件是 "completed"，则返回已完成的待办事项列表
        return todos.filter(todo => todo.completed);
    }
    return todos; // 如果当前过滤条件是 "all"，则返回所有待办事项列表
}

// 切换单个待办事项的选中状态
function toggleSelectTodo(id) {
    if (selectedTodos.has(id)) { // 如果当前待办事项已被选中，则取消选中
        selectedTodos.delete(id);
    } else { // 如果当前待办事项未被选中，则选中它
        selectedTodos.add(id);
    }
    updateBatchActionsVisibility(); // 更新批量操作按钮的显示状态
    renderTodos(); // 重新渲染待办事项列表，更新选中状态的显示
}


// 事件监听
addButton.addEventListener('click', addTodo); // 监听添加按钮的点击事件，触发添加待办事项的函数

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
}); // 监听 Enter 键，按下时触发添加待办事项的函数

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.getAttribute('data-filter')); // 监听过滤按钮的点击事件，触发切换过滤条件的函数
    });
}); // 监听每个过滤按钮的点击事件，根据按钮的 data-filter 属性来切换过滤条件

clearCompletedBtn.addEventListener('click', clearCompleted); // 监听清除已完成按钮的点击事件，触发清除已完成待办事项的函数

/* ===== 批量操作按钮的事件监听 =====*/
selectAllBtn.addEventListener('click', toggleSelectAll); // 监听全选/全不选按钮的点击事件，触发切换全选状态的函数
invertSelectBtn.addEventListener('click', invertSelection); // 监听反选按钮的点击事件，触发切换反选状态的函数
batchCompleteBtn.addEventListener('click', batchComplete); // 监听批量标记为已完成按钮的点击事件，触发批量标记为已完成的函数
batchUncompleteBtn.addEventListener('click', batchUncomplete); // 监听批量标记为未完成按钮的点击事件，触发批量标记为未完成的函数
batchDeleteBtn.addEventListener('click', batchDelete); // 监听批量删除按钮的点击事件，触发批量删除的函数
batchCancelBtn.addEventListener('click', clearSelection); // 监听取消选择按钮的点击事件，触发取消批量操作的函数

// 键盘快捷键监听
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'a') { // Ctrl + A 全选
        e.preventDefault(); // 阻止默认的全选行为，避免选中页面上的其他内容
        toggleSelectAll();
    }

    if (e.ctrlKey && e.key === 'd') { // Ctrl + D 取消全选
        e.preventDefault(); // 阻止默认的行为，避免触发浏览器的书签功能
        clearSelection();
    }

    if (e.key === 'Delete' && selectedTodos.size > 0) { // Delete 键删除选中的待办事项
        e.preventDefault(); // 阻止默认的行为，避免触发浏览器的删除功能
        batchDelete();
    }

    // Ctrl + Enter 快速添加
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        addTodo();
    }

});

loadTodos(); // 初始化加载数据