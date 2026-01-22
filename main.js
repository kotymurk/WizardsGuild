const API = 'http://localhost:4000';

document.addEventListener('DOMContentLoaded', () => {
  const ordersList = document.getElementById('orders');

  //модалочка
  const modal = document.getElementById('confirmModal');
  const closeBtn = document.getElementById('modalClose');
  const cancelBtn = document.getElementById('cancelDelete');
  const confirmBtn = document.getElementById('confirmDelete');

  let orderIdToDelete = null;

  getOrders();

  //получение заказов
  function getOrders() {
    fetch(`${API}/orders`)
      .then((res) => res.json())
      .then((orders) => {
        ordersList.innerHTML = '';

        orders.forEach((order) => {
          const card = document.createElement('li');
          card.className = 'order-card';

          const avatar = document.createElement('img');
          avatar.src = order.assignee.avatar;
          avatar.alt = order.assignee.name;
          avatar.width = 40;

          card.appendChild(avatar);

          const title = document.createElement('h3');
          title.textContent = order.title;

          const description = document.createElement('p');
          description.textContent = order.description;

          const customer = document.createElement('p');
          customer.textContent = `Заказчик: ${order.customerName}`;

          const assignee = document.createElement('p');
          assignee.textContent = `Исполнитель: ${order.assignee.name}`;

          const status = document.createElement('p');
          status.textContent = `Статус: ${order.status}`;

          const reward = document.createElement('p');
          reward.textContent = `Награда: $${order.reward}`;

          const deadline = document.createElement('p');
          deadline.textContent = `Дедлайн: ${order.deadline}`;

          const createdAt = document.createElement('p');
          createdAt.textContent = `Создан: ${order.createdAt}`;

          card.appendChild(
            title,
            description,
            customer,
            assignee,
            status,
            reward,
            deadline,
            createdAt,
          );

          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = 'Удалить';
          deleteBtn.addEventListener('click', () => {
            orderIdToDelete = order.id;
            openModal();
          });

          const editBtn = document.createElement('button');
          editBtn.textContent = 'Изменить статус';
          editBtn.style.marginRight = '5px';
          editBtn.addEventListener('click', () => updateOrderStatus(order));

          card.appendChild(deleteBtn);
          card.appendChild(editBtn);

          ordersList.appendChild(card);
        });
      });
  }

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

  function openModal() {
    modal.classList.remove('hidden');
  }

  function closeModal() {
    modal.classList.add('hidden');
    orderIdToDelete = null;
  }

  //put
  function updateOrderStatus(id, order) {
    const newStatus = prompt('Введите новый статус заказа:', order.status);

    if (!newStatus) return;

    const updatedOrder = { ...order, status: newStatus };

    fetch(`${API}/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedOrder),
    }).then(() => getOrders());
  }

  //загрузка заказов при старте
  getOrders();
});
