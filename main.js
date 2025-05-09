const jsonServer = require('json-server');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

// Tạo adapter cho từng file
const usersAdapter = new FileSync(path.join(__dirname, 'data', 'users.json'));
const productsAdapter = new FileSync(path.join(__dirname, 'data', 'products.json'));
const cartAdapter = new FileSync(path.join(__dirname, 'data', 'cart.json'));
const vouchersAdapter = new FileSync(path.join(__dirname, 'data', 'vouchers.json'));
const ordersAdapter = new FileSync(path.join(__dirname, 'data', 'orders.json'));
const commentsAdapter = new FileSync(path.join(__dirname, 'data', 'comments.json'));
const addressesAdapter = new FileSync(path.join(__dirname, 'data', 'vietnam-addresses.json'));

// Khởi tạo các database
const usersDb = low(usersAdapter);
const productsDb = low(productsAdapter);
const cartDb = low(cartAdapter);
const vouchersDb = low(vouchersAdapter);
const ordersDb = low(ordersAdapter);
const commentsDb = low(commentsAdapter);
const addressesDb = low(addressesAdapter);

// Khởi tạo giá trị mặc định nếu file trống
cartDb.defaults({ cart: [] }).write();
usersDb.defaults({ users: [] }).write();
productsDb.defaults({ products: [] }).write();
vouchersDb.defaults({ vouchers: [] }).write();
ordersDb.defaults({ orders: [] }).write();
commentsDb.defaults({ comments: [] }).write();

const server = jsonServer.create();
const router = jsonServer.router({
  users: usersDb.get('users').value(),
  products: productsDb.get('products').value(),
  cart: cartDb.get('cart').value(),
  vouchers: vouchersDb.get('vouchers').value(),
  orders: ordersDb.get('orders').value(),
  comments: commentsDb.get('comments').value(),
  'vietnam-addresses': addressesDb.value()
});

// Middleware để lưu dữ liệu vào file sau mỗi request
server.use((req, res, next) => {
  res.on('finish', () => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const data = router.db.getState();
      
      // Lưu dữ liệu vào các file tương ứng
      usersDb.set('users', data.users).write();
      productsDb.set('products', data.products).write();
      cartDb.set('cart', data.cart).write();
      vouchersDb.set('vouchers', data.vouchers).write();
      ordersDb.set('orders', data.orders).write();
      commentsDb.set('comments', data.comments).write();
      addressesDb.setState(data['vietnam-addresses']).write();
    }
  });
  next();
});

const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
});