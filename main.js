const API = 'http://localhost:4000';

document.addEventListener('DOMContentLoaded', () => {
  const ordersList = document.getElementById('orders');

  if (!ordersList) {
    console.error('#orders не найдены!');
    return;
  }

  //модалочка удаления
  const deleteModal = document.getElementById('confirmModal');
  const deleteCloseBtn = document.getElementById('modalClose');
  const deleteCancelBtn = document.getElementById('cancelDelete');
  const deleteConfirmBtn = document.getElementById('confirmDelete');

  //модалка редактирования

  const editModal = document.getElementById('edit-modal');
  const editTitleInput = document.getElementById('edit-title');
  const editDescriptionInput = document.getElementById('edit-description');
  const editSaveBtn = document.getElementById('save-edit');
  const editCancelBtn = document.getElementById('cancel-edit');

  //модалка редактирования статуса
  const statusModal = document.getElementById('edit-status');
  const statusSelect = document.getElementById('status-select');
  const statusSaveBtn = document.getElementById('save-status');
  const statusCancelBtn = document.getElementById('cancel-status');

  if (
    !deleteModal ||
    !deleteCloseBtn ||
    !deleteCancelBtn ||
    !deleteConfirmBtn ||
    !editModal ||
    !editTitleInput ||
    !editDescriptionInput ||
    !editSaveBtn ||
    !editCancelBtn ||
    !statusModal ||
    !statusSelect ||
    !statusSaveBtn ||
    !statusCancelBtn
  ) {
    console.error('Один или несколько элементов модалок не найдены!');
    return;
  }

  //статусный селектор
  const STATUS_TEXT = {
    new: 'Новый',
    in_progress: 'В процессе',
    completed: 'Выполнено',
  };

  let orders = [];
  let currentOrder = null;
  let orderIdToDelete = null;

  //получение заказов
  async function getOrders() {
    try {
      const res = await fetch(`${API}/orders`);
      if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
      orders = await res.json();
      renderOrders();
    } catch (error) {
      console.error('Не удалось загрузить заказы:', error);
      alert('Не удалось загрузить заказы. Попробуйте позже.');
    }
  }

  function renderOrders() {
    ordersList.innerHTML = '';
    orders.forEach((order) => {
      const card = document.createElement('li');
      card.className = 'order-card';

      card.innerHTML = `
          <img src="${order.assignee.avatar}" alt="${order.assignee.name}" width="40" />
          <h3>${order.title}</h3>
          <p>${order.description}</p>
          <p>Заказчик: ${order.customerName}</p>
          <p>Исполнитель: ${order.assignee.name}</p>
          <p>Статус: ${STATUS_TEXT[order.status] || order.status}</p>
          <p>Награда: $${order.reward}</p>
          <p>Дедлайн: ${new Date(order.deadline).toLocaleString()}</p>
          <p>Создан: ${new Date(order.createdAt).toLocaleString()}</p>
          <button class="edit-btn" data-id="${order.id}">Редактировать</button>
          <button class="status-btn" data-id="${order.id}">Изменить статус</button>
          <button class="delete-btn" data-id="${order.id}">Удалить</button>
        `;
      ordersList.appendChild(card);
    });
  }

  async function updateOrder(updatedData, closeModal) {
    if (!currentOrder) return;
    try {
      const res = await fetch(`${API}/orders/${currentOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...currentOrder, ...updatedData }),
      });
      if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
      closeModal();
      getOrders();
    } catch (error) {
      console.error('Не удалось обновить заказ:', error);
      alert('Не удалось сохранить изменения. Попробуйте позже.');
    }
  }

  ordersList.addEventListener('click', (e) => {
    const id = e.target.dataset.id;
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    currentOrder = order;

    if (e.target.classList.contains('edit-btn')) {
      editTitleInput.value = order.title;
      editDescriptionInput.value = order.description;
      editModal.classList.remove('hidden');
    }

    if (e.target.classList.contains('delete-btn')) {
      orderIdToDelete = order.id;
      deleteModal.classList.remove('hidden');
    }

    if (e.target.classList.contains('status-btn')) {
      statusSelect.value = order.status;
      statusModal.classList.remove('hidden');
    }
  });

  // Функции закрытия модалок
  function closeDeleteModal() {
    deleteModal.classList.add('hidden');
    orderIdToDelete = null;
  }

  function closeEditModal() {
    editModal.classList.add('hidden');
    currentOrder = null;
  }

  function closeStatusModal() {
    statusModal.classList.add('hidden');
    currentOrder = null;
  }

  // Закрытие модалок
  deleteCloseBtn.addEventListener('click', closeDeleteModal);
  deleteCancelBtn.addEventListener('click', closeDeleteModal);

  editCancelBtn.addEventListener('click', closeEditModal);
  statusCancelBtn.addEventListener('click', closeStatusModal);

  // Подтверждение удаления
  deleteConfirmBtn.addEventListener('click', async () => {
    if (orderIdToDelete === null) return;
    try {
      const res = await fetch(`${API}/orders/${orderIdToDelete}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
      closeDeleteModal();
      getOrders();
    } catch (error) {
      console.error('Не удалось удалить заказ:', error);
      alert('Не удалось удалить заказ. Попробуйте позже.');
    }
  });

  // Сохранение редактирования
  editSaveBtn.addEventListener('click', () => {
    if (!currentOrder) return;
    const title = editTitleInput.value.trim();
    const description = editDescriptionInput.value.trim();

    if (!title) {
      alert('Введите название заказа!');
      return;
    }

    if (!description) {
      alert('Введите описание заказа!');
      return;
    }

    updateOrder({ title, description }, closeEditModal);
  });

  // Сохранение изменения статуса
  statusSaveBtn.addEventListener('click', () => {
    if (!currentOrder) return;
    if (!STATUS_TEXT[statusSelect.value]) {
      alert('Выберите корректный статус!');
      return;
    }
    updateOrder({ status: statusSelect.value }, closeStatusModal);
  });

  // Загрузка заказов при старте
  getOrders();
});
