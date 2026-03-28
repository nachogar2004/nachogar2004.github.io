(function () {
  const STORAGE_KEY = "space-cart";

  function getCart() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.map(function (item) {
        return {
          id: item.id,
          artist: item.artist,
          title: item.title,
          price: Number(item.price) || 0,
          quantity: 1,
        };
      });
    } catch (error) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function formatPrice(value) {
    return Number(value).toLocaleString("es-ES") + " EUR";
  }

  function updateCatalogStatus() {
    const status = document.getElementById("cart-status");
    if (!status) {
      return;
    }
    const totalItems = getCart().reduce(function (sum, item) {
      return sum + item.quantity;
    }, 0);
    status.textContent = "Carrito: " + totalItems + " cuadros seleccionados.";
  }

  function addToCart(item) {
    const cart = getCart();
    const existing = cart.find(function (entry) {
      return entry.id === item.id;
    });

    if (existing) {
      return false;
    } else {
      cart.push({
        id: item.id,
        artist: item.artist,
        title: item.title,
        price: item.price,
        quantity: 1,
      });
    }

    saveCart(cart);
    updateCatalogStatus();
    refreshCatalogButtons();
    return true;
  }

  function refreshCatalogButtons() {
    const cart = getCart();
    const ids = cart.map(function (item) {
      return item.id;
    });

    document.querySelectorAll(".add-to-cart").forEach(function (button) {
      const alreadyAdded = ids.includes(button.dataset.id);
      button.disabled = alreadyAdded;
      button.textContent = alreadyAdded ? "Añadido" : "Añadir al carrito";
    });
  }

  function setupCatalogActions() {
    const buttons = document.querySelectorAll(".add-to-cart");
    if (!buttons.length) {
      return;
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        const wasAdded = addToCart({
          id: button.dataset.id,
          artist: button.dataset.artist,
          title: button.dataset.title,
          price: Number(button.dataset.price),
        });
        if (!wasAdded) {
          button.disabled = true;
          button.textContent = "Añadido";
        }
      });
    });

    updateCatalogStatus();
    refreshCatalogButtons();
  }

  function removeFromCart(id) {
    const updated = getCart().filter(function (item) {
      return item.id !== id;
    });
    saveCart(updated);
    renderOrderCart();
    updateCatalogStatus();
  }

  function renderOrderCart() {
    const body = document.getElementById("cart-items-body");
    const total = document.getElementById("cart-total");
    if (!body || !total) {
      return;
    }

    const cart = getCart();
    if (!cart.length) {
      body.innerHTML = '<tr><td colspan="6">Tu carrito esta vacio. Ve al catalogo para anadir cuadros.</td></tr>';
      total.textContent = "Total: 0 EUR";
      return;
    }

    let totalPrice = 0;
    body.innerHTML = cart
      .map(function (item) {
        const subtotal = item.price * item.quantity;
        totalPrice += subtotal;
        return (
          "<tr>" +
          "<td>" + item.artist + "</td>" +
          "<td>" + item.title + "</td>" +
          "<td>" + item.quantity + "</td>" +
          "<td>" + formatPrice(item.price) + "</td>" +
          "<td>" + formatPrice(subtotal) + "</td>" +
          '<td><button class="remove-item" type="button" data-remove-id="' +
          item.id +
          '">Quitar</button></td>' +
          "</tr>"
        );
      })
      .join("");

    total.textContent = "Total: " + formatPrice(totalPrice);

    document.querySelectorAll(".remove-item").forEach(function (button) {
      button.addEventListener("click", function () {
        removeFromCart(button.dataset.removeId);
      });
    });
  }

  setupCatalogActions();
  renderOrderCart();
})();
