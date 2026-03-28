(function () {
  const CLAVE_CARRITO = "space-cart";

  function obtenerCarrito() {
    const datosBrutos = localStorage.getItem(CLAVE_CARRITO);
    if (!datosBrutos) {
      return [];
    }
    try {
      const carritoParseado = JSON.parse(datosBrutos);
      if (!Array.isArray(carritoParseado)) {
        return [];
      }
      return carritoParseado.map(function (item) {
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

  function guardarCarrito(carrito) {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  }

  function formatearPrecio(valor) {
    return Number(valor).toLocaleString("es-ES") + " EUR";
  }

  function actualizarEstadoCatalogo() {
    const estado = document.getElementById("cart-status");
    if (!estado) {
      return;
    }
    const totalElementos = obtenerCarrito().reduce(function (suma, item) {
      return suma + item.quantity;
    }, 0);
    estado.textContent = "Carrito: " + totalElementos + " cuadros seleccionados.";
  }

  function agregarAlCarrito(item) {
    const carrito = obtenerCarrito();
    const existente = carrito.find(function (entrada) {
      return entrada.id === item.id;
    });

    if (existente) {
      return false;
    } else {
      carrito.push({
        id: item.id,
        artist: item.artist,
        title: item.title,
        price: item.price,
        quantity: 1,
      });
    }

    guardarCarrito(carrito);
    actualizarEstadoCatalogo();
    actualizarBotonesCatalogo();
    return true;
  }

  function actualizarBotonesCatalogo() {
    const carrito = obtenerCarrito();
    const ids = carrito.map(function (item) {
      return item.id;
    });

    document.querySelectorAll(".add-to-cart").forEach(function (boton) {
      const yaAnadido = ids.includes(boton.dataset.id);
      boton.disabled = yaAnadido;
      boton.textContent = yaAnadido ? "Añadido" : "Añadir al carrito";
    });
  }

  function configurarAccionesCatalogo() {
    const botones = document.querySelectorAll(".add-to-cart");
    if (!botones.length) {
      return;
    }

    botones.forEach(function (boton) {
      boton.addEventListener("click", function () {
        const seAnadio = agregarAlCarrito({
          id: boton.dataset.id,
          artist: boton.dataset.artist,
          title: boton.dataset.title,
          price: Number(boton.dataset.price),
        });
        if (!seAnadio) {
          boton.disabled = true;
          boton.textContent = "Añadido";
        }
      });
    });

    actualizarEstadoCatalogo();
    actualizarBotonesCatalogo();
  }

  function quitarDelCarrito(id) {
    const carritoActualizado = obtenerCarrito().filter(function (item) {
      return item.id !== id;
    });
    guardarCarrito(carritoActualizado);
    renderizarPedido();
    actualizarEstadoCatalogo();
  }

  function renderizarPedido() {
    const lista = document.getElementById("cart-items-list");
    const total = document.getElementById("cart-total");
    if (!lista || !total) {
      return;
    }

    const carrito = obtenerCarrito();
    if (!carrito.length) {
      lista.innerHTML = '<p class="cart-empty">Tu carrito está vacío. Ve al catálogo para añadir cuadros.</p>';
      total.textContent = "Total: 0 EUR";
      return;
    }

    let precioTotal = 0;
    lista.innerHTML = carrito
      .map(function (item) {
        const subtotal = item.price * item.quantity;
        precioTotal += subtotal;
        return (
          '<article class="cart-item">' +
          '<p><strong>Cuadro:</strong> ' + item.title + "</p>" +
          '<p><strong>Artista:</strong> ' + item.artist + "</p>" +
          '<p><strong>Precio:</strong> ' + formatearPrecio(item.price) + "</p>" +
          '<button class="remove-item" type="button" data-remove-id="' +
          item.id +
          '">Quitar</button>' +
          "</article>"
        );
      })
      .join("");

    total.textContent = "Total: " + formatearPrecio(precioTotal);

    document.querySelectorAll(".remove-item").forEach(function (boton) {
      boton.addEventListener("click", function () {
        quitarDelCarrito(boton.dataset.removeId);
      });
    });
  }

  configurarAccionesCatalogo();
  renderizarPedido();
})();
