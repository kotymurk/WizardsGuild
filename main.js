const API = 'http://localhost:4000';

const ordersList = document.getElementById('orders');

//получение заказов
function getOrders() {
  fetch(`${API}/orders`)
    .then((res) => res.json())
    .then((orders) => {
      ordersList.innerHTML = '';

      orders.forEach((order) => {
        const li = document.createElement('li');
        const img = document.createElement('img');
        img.src = order.assignee.avatar;
        img.alt = order.assignee.name;
        img.width = 40;
        img.style.verticalAlign = 'middle';
        img.style.marginRight = '10px';

        li.appendChild(img);

        const text = document.createElement('span');
        text.textContent = `${order.title} — ${order.customerName} (${order.status})`;
        li.appendChild(text);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Удалить';
        deleteBtn.onclick = () => deleteOrder(order.id);

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Изменить статус';
        editBtn.style.marginRight = '5px';
        editBtn.onclick = () => updateOrderStatus(order.id, order);

        li.appendChild(deleteBtn);
        li.appendChild(editBtn);

        ordersList.appendChild(li);
      });
    });
}
//get
function getOrderById(id) {
  return fetch(`${API}/orders/${id}`).then((res) => res.json());
}

//удаление заказа
function deleteOrder(id) {
  fetch(`${API}/orders/${id}`, {
    method: 'DELETE',
  }).then(() => getOrders());
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
