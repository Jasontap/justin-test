const { client } = require("./client.js");
// const {  } = require("./");

//returns cart object, created with supplied user
async function createCart({ id }) {
  try {
    if (id) {
      const { rows: [cart] } = await client.query
        (`
                INSERT INTO cart("userId")
                VALUES($1)
                RETURNING *;
                `, [id]);

      return cart;
    }
  } catch (error) {
    throw ('Nope, no Cart for you, my bad G. find me in cart.js');
  }
}

//sets the cart to purchased; arameter is a cart object, returns cart object
// async function convertCartToPurchased({ id }) {
//     try {
//       let {
//         rows: [cart],
//       } = await client.query
//               (`UPDATE cart
//               SET purchases = true
//               WHERE id = $1
//               RETURNING *;`, [id]);

//       cart = await attachItemsToCarts([cart]);
//       for (const item in cart.items) {
//         await reduceInventory(item.id, item.quantity);
//       }
//       return cart;
//     } catch (error) {
//       throw error;
//     }
//   }


//deletes non-purchased carts -- parameter is a user object, returns nothing
async function deleteActiveCart({ id }) {
  try {
    if (id) {
      //need to get cart to delete, delete its items, then delete the cart
      const rows = await client.query
        (`SELECT * FROM cart
                   WHERE "userId" = $1                                    
                   `, [id]);

      const cartId = rows[0]?.id;
      await client.query
        (`DELETE FROM cart_items
              WHERE cart_id = $1;
              DELETE FROM cart
              WHERE id = $1;`, [cartId]);
    }
  } catch (error) {
    throw error;
  }
}

//gets all the carts; parameter is a user object, returns an array of carts with cart_items attached
// async function getPurchasedCartsByUser({ id }) {
//     try {
//       const { rows: carts } = await client.query
//             (`SELECT * FROM cart
//               WHERE cart."userId" = $1
//               AND purchases = true;
//               `, [id]);
//       const cartsWithItems = await attachItemsToCarts(carts);
//       const CartsWithOrders = await attachOrdertoCart(cartsWithItems);
//         return CartsWithOrders;
//       } catch (error) {
//         throw error;
//       }
//   }

//attaches the order to the cart
async function attachOrdertoCart(carts) {
  const cartsToReturn = [...carts];
  const binds = carts.map((_, index) => `$${index + 1}`).join(", ");
  if (!cartsIds?.length) return [];
  try {
    const { rows: orders } = await client.query
      (`
              SELECT orders.*
              FROM cart 
              JOIN orders ON orders.cart_id = cart.id
              WHERE orders.cart_id IN (${binds});
            `, cartsIds);

    for (const cart of cartsToReturn) {
      const ordersToAdd = orders.filter((order) => order.cart_id === cart.id);

      cart.order = ordersToAdd;
    }
    return cartsToReturn;
  } catch (error) {
    console.error(error);
  }
}


//gets active cart, takes in user object and returns cart object
async function getActiveCart({ id }) {
  try {
    console.log("starting to get the cart");
    const { rows: [cart] } = await client.query
      (`SELECT * FROM cart
        WHERE cart."userId" = $1       
        `, [id]);

    return cart

    // if (cart) return attachItemsToCarts([cart]);
    // const newCart = createCart({ id });
    // return attachItemsToCarts([newCart]);
  } catch (error) {
    throw error;
  }
}


// async function getAllPurchasedCarts() {
//   try {
//     const { rows } = await client.query
//     (`SELECT * FROM cart
//       WHERE purchases = true;
//       `);
//     const cartsWithItems = await attachItemsToCarts(rows);
//     const CartsWithOrders = await attachOrdertoCart(cartsWithItems);
//     return CartsWithOrders;
//   } catch (error) {
//     throw error;
//   }
// }


// async function deleteAbandonedGuestCarts() {
//   try {
//     await client.query //getting realtion "cart_items" does not exist
//         (`DELETE FROM cart_items WHERE id IN 
//         (SELECT cart_items.id as ccid 
//         FROM cart_items JOIN cart ON cart.id = cart_items.cart_id
//         WHERE purchases = FALSE AND "userId" = 9999);
//         DELETE FROM cart WHERE
//         purchases = FALSE AND
//         "userId" = 9999;
//       `)
//   } catch (error) {
//     throw error;
//   }
// }


module.exports = {
  createCart,
  deleteActiveCart,
  getActiveCart,
  // getPurchasedCartsByUser,
  // convertCartToPurchased,  
  // getAllPurchasedCarts,
  // // getActiveCartId,
  // deleteAbandonedGuestCarts
};