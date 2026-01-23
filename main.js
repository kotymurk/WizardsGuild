const API = 'http://localhost:4000';

document.addEventListener('DOMContentLoaded', () => {
  const ordersList = document.getElementById('orders');

  //модалочка удаления
  const modal = document.getElementById('confirmModal');
  const closeBtn = document.getElementById('modalClose');
  const cancelBtn = document.getElementById('cancelDelete');
  const confirmBtn = document.getElementById('confirmDelete');

  let orderIdToDelete = null;

  //модалка редактирования

  const editModal = document.getElementById('edit-modal');
  const editTitleInput = document.getElementById('edit-title');
  const editDescriptionInput = document.getElementById('edit-description');
  const saveStatusInput = document.getElementById('save-edit');
  const cancelStatusInput = document.getElementById('cancel-edit');

  let orders = [];
  let currentOrders = null;

  //получение заказов
  function getOrders() {
    fetch(`${API}/orders`)
      .then((res) => res.json())
      .then((data) => {
        orders = data;
        renderOrders();
      });
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
          <p>Статус: ${order.status}</p>
          <p>Награда: $${order.reward}</p>
          <p>Дедлайн: ${order.deadline}</p>
          <p>Создан: ${order.createdAt}</p>
          <button class="edit-btn" data-id="${order.id}">Редактировать</button>
          <button class="status-btn" data-id="${order.id}">Изменить статус</button>
          <button class="delete-btn" data-id="${order.id}">Удалить</button>
        `;
      ordersList.appendChild(card);
    });
  }

  ordersList.addEventListener('click', (e) => {
    const id = e.target.dataset.id;
    const order = orders.find((o) => o.id == id);

    if (e.target.classList.contains('edit-btn')) {
      currentOrders = order;
      editTitleInput.value = order.title;
      editDescriptionInput.value = order.description;
      editModal.classList.remove('hidden');
    }

    if (e.target.classList.contains('delete-btn')) {
      orderIdToDelete = order.id;
      modal.classList.remove('hidden');
    }

    if (e.target.classList.contains('status-btn')) {
      updateOrderStatus(order);
    }
  });

  //удаление заказа
  function deleteOrder() {
    if (orderIdToDelete === null) return;

    fetch(`${API}/orders/${orderIdToDelete}`, {
      method: 'DELETE',
    }).then(() => {
      closeModal();
      getOrders();
    });
  }

  function closeModal() {
    modal.classList.add('hidden');
    orderIdToDelete = null;
  }

  //put
  function updateOrderStatus(order) {
    const newStatus = prompt('Введите новый статус заказа:', order.status);

    if (!newStatus) return;

    const updatedOrder = { ...order, status: newStatus };

    fetch(`${API}/orders/${order.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedOrder),
    }).then(() => getOrders());
  }

  //загрузка заказов при старте
  getOrders();

  //сохранение изменений в модалке редактирования
  saveStatusInput.addEventListener('click', () => {
    if (!currentOrders) return;

    const updatedOrder = {
      ...currentOrders,
      title: editTitleInput.value,
      description: editDescriptionInput.value,
    };

    fetch(`${API}/orders/${currentOrders.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedOrder),
    }).then(() => {
      editModal.classList.add('hidden');
      currentOrders = null;
      getOrders();
    });
  });

  //отмена редактирования
  cancelStatusInput.addEventListener('click', () => {
    editModal.classList.add('hidden');
    currentOrders = null;
  });

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  confirmBtn.addEventListener('click', deleteOrder);
});
