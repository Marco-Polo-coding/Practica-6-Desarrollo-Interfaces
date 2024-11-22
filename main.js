const keyMappings = {
  title: "Title:",
  short_description: "Short description:",
  date: "Launch date:",
  category: "Category:",
  rating: "Rating:",
  tags: "Tags:",
};

class ProductsViewer extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.loadProducts();
  }

  async loadProducts() {
    try {
      const response = await fetch(
        `https://products-foniuhqsba-uc.a.run.app/Smartwatches%20and%20gadgets`
      );
      if (!response.ok) {
        throw new Error("Error al obtener los productos");
      }
      const products = await response.json();
      this.renderProducts(products);
    } catch (error) {
      console.error("Error:", error);
      this.innerHTML = `<p>Error al cargar los productos. Inténtelo nuevamente más tarde.</p>`;
    }
  }

  renderProducts(products) {
    const template = document.getElementById("product-template");

    // Limpiar contenido existente
    this.innerHTML = "";

    products.forEach((product) => {
      // Clonar el contenido de la plantilla
      const productContent = document.importNode(template.content, true);

      // Asignar datos al producto
      productContent.querySelector(".name").textContent = product.name;
      productContent.querySelector(".price").textContent = `${product.price}`;
      productContent.querySelector(".image").src = product.image;
      productContent
        .querySelector(".product")
        .setAttribute("data-id", product.id);

      // Renderizar tags si existen
      const tagsContainer = productContent.querySelector(".tags");
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach((tag) => {
          const tagElement = document.createElement("span");
          tagElement.textContent = `#${tag}`;
          tagElement.className =
            "bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs m-1 hover:bg-gray-300 hover:text-gray-900 transition-colors duration-200";
          tagsContainer.appendChild(tagElement);
        });
      }

      // Hacer clic en el producto redirige a la página de detalles
      productContent
        .querySelector(".product")
        .addEventListener("click", (e) => {
          // Evitar que el clic en el botón "Añadir al carrito" redirija
          if (
            e.target.classList.contains("add-to-cart") ||
            e.target.classList.contains("specs-btn")
          ) {
            e.stopPropagation();
            return;
          }
          window.location.href = `product.html?id=${product.id}`;
        });

        
      // Añadir el producto al componente
      this.appendChild(productContent);
    });
  }
}

// Definir el elemento personalizado
customElements.define("products-viewer", ProductsViewer);

const getId = () => {
  const searchParams = new URLSearchParams(location.search.slice(1));
  return Number(searchParams.get("id"));
};

class CustomProduct extends HTMLElement {
  constructor() {
    super();
    this.id = getId();
    console.log({ id: this.id });
  }

  connectedCallback() {
    this.render();
  }

  async loadProducts() {
    return fetch(
      "https://products-foniuhqsba-uc.a.run.app/Smartwatches%20and%20gadgets"
    ).then((res) => res.json());
  }

  async render() {
    // Obtener todos los productos desde la API
    const products = await this.loadProducts();
    console.log({ products });

    // Filtrar el producto por el id
    const product = products.find((product) => product.id == this.id);
    console.log({ product });

    // Rellenar el componente con los datos del producto
    if (product) {
      this.querySelector(".name").textContent = product.name;
      this.querySelector(".image").src = product.image;
      this.querySelector(".price").textContent = `${product.price}`;
      this.querySelector(".description").textContent = product.description;

      // Crear un contenedor para las características adicionales
      const featuresContainer = document.createElement("div");
      featuresContainer.classList.add("features", "mt-4");

      // Añadir propiedades básicas del producto como características adicionales
      for (const [key, value] of Object.entries(product)) {
        if (
          !["id", "name", "price", "image", "description", "features"].includes(
            key
          )
        ) {
          const feature = document.createElement("p");
          feature.classList.add("text-gray-700", "mb-2");
          const label = keyMappings[key] || key; // Usa la etiqueta mapeada o la clave original
          feature.innerHTML = `<strong>${label}</strong> ${value}`;
          featuresContainer.appendChild(feature);
        }
      }

      // Manejar la propiedad `features` si es un array
      if (Array.isArray(product.features)) {
        const featuresTitle = document.createElement("p");
        featuresTitle.classList.add("text-gray-800", "font-bold", "mt-4");
        featuresTitle.textContent = "Características:";
        featuresContainer.appendChild(featuresTitle);

        const featuresList = document.createElement("ul");
        featuresList.classList.add("list-disc", "pl-5", "mt-4");

        product.features.forEach((feature) => {
          const featureItem = document.createElement("li");
          featureItem.classList.add("text-gray-700", "mb-2");

          // Mostrar solo el valor de cada feature, eliminando las claves
          featureItem.textContent = feature.value || feature;
          featuresList.appendChild(featureItem);
        });

        // Añadir la lista al contenedor de características
        featuresContainer.appendChild(featuresList);
      }

      // Añadir las características al componente
      this.appendChild(featuresContainer);
    } else {
      this.innerHTML = `<p>Producto no encontrado.</p>`;
    }

    // console.log("Producto renderizado correctamente");
  }
}

customElements.define("custom-product", CustomProduct);

class ProductSearch extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
          <style>
              dialog {
                  border: 1px solid #e5e7eb;
                  border-radius: 0.5rem;
                  padding: 1rem;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  max-width: 800px;
                  width: 100%;
                  overflow-y: auto;
                  max-height: 80vh;
                  text-align: center;
              }

              input {
                  width: 100%;
                  padding: 0.5rem 1rem;
                  border: 1px solid #d1d5db;
                  border-radius: 0.5rem;
                  margin-bottom: 1rem;
                  outline: none;
                  font-size: 1rem;
              }

              .product-card {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  padding: 1rem;
                  border: 1px solid #e5e7eb;
                  border-radius: 0.5rem;
                  margin-bottom: 1rem;
                  background-color: #ffffff;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  transition: transform 0.2s, box-shadow 0.2s;
                  cursor: pointer;
              }

              .product-card:hover {
                  transform: translateY(-5px);
                  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
              }

              .product-card img {
                  width: 120px;
                  height: 120px;
                  object-fit: cover;
                  border-radius: 0.5rem;
                  margin-bottom: 1rem;
              }

              .product-info {
                  text-align: center;
              }

              .product-name {
                  font-weight: bold;
                  font-size: 1.2rem;
                  margin-bottom: 0.5rem;
                  color: #333;
              }

              .product-price {
                  color: #4caf50;
                  font-weight: bold;
                  margin-bottom: 0.5rem;
              }

              .product-description {
                  color: #6b7280;
                  font-size: 0.9rem;
              }

              .close-btn {
                  position: absolute;
                  top: 0.5rem;
                  right: 0.5rem;
                  background: transparent;
                  border: none;
                  font-size: 1.5rem;
                  cursor: pointer;
                  color: #6b7280;
              }

              .close-btn:hover {
                  color: #4b5563;
              }

              #open-search-dialog {
                  background: transparent;
                  border: none;
                  cursor: pointer;
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
              }

              #open-search-dialog svg {
                  height: 2rem;
                  width: 2rem;
                  fill: none;
                  stroke: white;
                  stroke-width: 2;
              }

              #open-search-dialog:hover svg {
                  stroke: #facc15;
              }

              dialog h2 {
                  text-align: center;
                  font-weight: bold;
                  font-size: 1.5rem;
                  margin-bottom: 1rem;
              }
          </style>
          <button id="open-search-dialog" class="hover:text-yellow-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8" stroke-linecap="round" stroke-linejoin="round"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-linecap="round" stroke-linejoin="round">
                  </line>
              </svg>
          </button>

          <dialog>
              <button class="close-btn">&times;</button>
              <h2>¿Qué quieres buscar?</h2>
              <input type="text" id="search-input" placeholder="Escribe para buscar..." />
              <div id="search-results"></div>
          </dialog>
      `;

    this.dialog = this.shadowRoot.querySelector("dialog");
    this.searchInput = this.shadowRoot.querySelector("#search-input");
    this.searchResults = this.shadowRoot.querySelector("#search-results");
    this.openDialogBtn = this.shadowRoot.querySelector("#open-search-dialog");
    this.closeDialogBtn = this.shadowRoot.querySelector(".close-btn");

    this.addEventListeners();
  }

  addEventListeners() {
    this.openDialogBtn.addEventListener("click", () => {
      this.dialog.showModal();
      this.searchResults.innerHTML = "";
      this.searchInput.value = "";
    });
    this.closeDialogBtn.addEventListener("click", () => this.dialog.close());
    this.searchInput.addEventListener("input", (e) =>
      this.performSearch(e.target.value)
    );
    this.fetchAndDisplayAllProducts();
  }

  async fetchAndDisplayAllProducts() {
    try {
      const response = await fetch(
        "https://products-foniuhqsba-uc.a.run.app/Smartwatches%20and%20gadgets"
      );
      const products = await response.json();
      this.allProducts = products;
    } catch (error) {
      console.error("Error al cargar los productos:", error);
      this.allProducts = [];
    }
  }

  async performSearch(term) {
    const lowerTerm = term.toLowerCase().trim();

    // Si el término de búsqueda está vacío, no mostrar productos
    if (!lowerTerm) {
      this.searchResults.innerHTML = ""; // Limpiar resultados
      return;
    }

    const filteredProducts = this.allProducts.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const description = product.short_description?.toLowerCase() || "";
      const tags = product.tags
        ? product.tags.map((tag) => tag?.toLowerCase()).join(" ")
        : "";
      const category = product.category?.toLowerCase() || "";

      return (
        name.includes(lowerTerm) ||
        description.includes(lowerTerm) ||
        tags.includes(lowerTerm) ||
        category.includes(lowerTerm)
      );
    });

    this.renderProducts(filteredProducts);
  }

  renderProducts(products) {
    this.searchResults.innerHTML = "";

    if (products.length === 0) {
      const noResults = document.createElement("p");
      noResults.textContent = "No se encontraron productos.";
      noResults.style.color = "#9ca3af";
      noResults.style.textAlign = "center";
      this.searchResults.appendChild(noResults);
      return;
    }

    products.forEach((product) => {
      const card = document.createElement("div");
      card.className = "product-card";

      const img = document.createElement("img");
      img.src = product.image;
      img.alt = product.name;

      const info = document.createElement("div");
      info.className = "product-info";

      const name = document.createElement("p");
      name.className = "product-name";
      name.textContent = product.name;

      const price = document.createElement("p");
      price.className = "product-price";
      price.textContent = `Precio: ${product.price}`;

      const description = document.createElement("p");
      description.className = "product-description";
      description.textContent = product.short_description || "Sin descripción";

      info.appendChild(name);
      info.appendChild(price);
      info.appendChild(description);

      card.appendChild(img);
      card.appendChild(info);

      card.addEventListener("click", () => {
        window.location.href = `product.html?id=${product.id}`;
      });

      this.searchResults.appendChild(card);
    });
  }
}

customElements.define("product-search", ProductSearch);

class ShoppingCart extends HTMLElement {
  constructor() {
    super();
    this.cartItems = [];
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.updateCartIcon();
    this.addEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .cart-icon {
          position: relative;
          cursor: pointer;
        }

        .cart-counter {
          position: absolute;
          top: -5px;
          right: -10px;
          background: #f00;
          color: white;
          font-size: 12px;
          font-weight: bold;
          border-radius: 50%;
          padding: 0 5px;
        }

        dialog {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-width: 800px;
          width: 100%;
          overflow-y: auto;
          max-height: 80vh;
        }

        .cart-summary {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }

        .cart-item img {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 0.5rem;
        }

        .cart-item-details {
          flex: 1;
          margin-left: 1rem;
        }

        .cart-total {
          font-weight: bold;
          text-align: right;
          margin-top: 1rem;
        }

        .checkout-button {
          display: block;
          width: 100%;
          padding: 1rem;
          background: black;
          color: white;
          text-align: center;
          font-weight: bold;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
        }

        .checkout-button:hover {
          background: #333;
        }

        .empty-cart {
          text-align: center;
          color: #9ca3af;
          font-size: 1rem;
          margin-top: 2rem;
        }

        .close-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: transparent;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6b7280;
        }

        .close-btn:hover {
          color: #4b5563;
        }
      </style>

      <button class="cart-icon">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2-8H2m5 8h10m-2 0a2 2 0 11-4 0m4 0a2 2 0 11-4 0" />
        </svg>
        <span class="cart-counter">0</span>
      </button>

      <dialog>
        <button class="close-btn">&times;</button>
        <h2>Resumen del Carrito</h2>
        <div class="cart-summary"></div>
        <div class="cart-total"></div>
        <button class="checkout-button">Comprar</button>
      </dialog>
    `;
  }

  addEventListeners() {
    const cartIcon = this.shadowRoot.querySelector(".cart-icon");
    const dialog = this.shadowRoot.querySelector("dialog");
    const closeBtn = this.shadowRoot.querySelector(".close-btn");
    const checkoutButton = this.shadowRoot.querySelector(".checkout-button");

    cartIcon.addEventListener("click", () => dialog.showModal());
    closeBtn.addEventListener("click", () => dialog.close());
    checkoutButton.addEventListener("click", () => this.checkout());
  }

  addToCart(product) {
    const existingItem = this.cartItems.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cartItems.push({ ...product, quantity: 1 });
    }

    this.updateCartIcon();
    this.updateCartSummary();
  }

  updateCartIcon() {
    const cartCounter = this.shadowRoot.querySelector(".cart-counter");
    const totalItems = this.cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    cartCounter.textContent = totalItems;
  }

  updateCartSummary() {
    const cartSummary = this.shadowRoot.querySelector(".cart-summary");
    const cartTotal = this.shadowRoot.querySelector(".cart-total");

    cartSummary.innerHTML = "";

    if (this.cartItems.length === 0) {
      cartSummary.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
      cartTotal.textContent = "";
      return;
    }

    this.cartItems.forEach((item) => {
      const cartItem = document.createElement("div");
      cartItem.className = "cart-item";

      cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}" />
        <div class="cart-item-details">
          <p>${item.name}</p>
          <p>Cantidad: ${item.quantity}</p>
        </div>
        <p>${item.price} €</p>
      `;

      cartSummary.appendChild(cartItem);
    });

    const total = this.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    cartTotal.textContent = `Total: ${total.toFixed(2)} €`;
  }

  checkout() {
    alert("¡Gracias por tu compra! El carrito será vaciado.");
    this.cartItems = [];
    this.updateCartIcon();
    this.updateCartSummary();
    this.shadowRoot.querySelector("dialog").close();
  }
}

// Define el elemento personalizado
customElements.define("shopping-cart", ShoppingCart);

// Añadir funcionalidad al botón "Add to cart"
// document.addEventListener("DOMContentLoaded", () => {
//   const cartElement = document.querySelector("shopping-cart");

//   document.querySelectorAll(".add-to-cart").forEach((button) => {
//     button.addEventListener("click", (event) => {
//       const productCard = event.target.closest(".product");
//       const product = {
//         id: productCard.dataset.id,
//         name: productCard.querySelector(".name").textContent,
//         price: parseFloat(
//           productCard.querySelector(".price").textContent.replace("€", "")
//         ),
//         image: productCard.querySelector(".image").src,
//       };

//       cartElement.addToCart(product);
//     });
//   });
// });

document.addEventListener("DOMContentLoaded", () => {
  // Usar delegación de eventos para manejar botones dinámicos
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("add-to-cart")) {
      // Encontrar el contenedor del producto relacionado
      const productCard = event.target.closest(".product");

      if (!productCard) {
        console.error("No se pudo encontrar el contenedor del producto.");
        return;
      }

      // Crear el objeto del producto
      const product = {
        id: productCard.dataset.id,
        name: productCard.querySelector(".name").textContent,
        price: parseFloat(
          productCard.querySelector(".price").textContent.replace("€", "")
        ),
        image: productCard.querySelector(".image").src,
        quantity: 1,
      };

      // Manejar el carrito con localStorage
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingItemIndex = cart.findIndex((item) => item.id === product.id);

      if (existingItemIndex > -1) {
        // Si el producto ya existe, incrementar la cantidad
        cart[existingItemIndex].quantity += 1;
      } else {
        // Si no existe, añadir al carrito
        cart.push(product);
      }

      // Guardar el carrito actualizado en localStorage
      localStorage.setItem("cart", JSON.stringify(cart));

      // Confirmación en la consola
      console.log("Producto añadido al carrito:", product);
      console.log("Estado actual del carrito:", cart);

      // Opcional: Actualizar el contador del carrito
      updateCartCounter();
    }
  });

  // Función para actualizar el contador del carrito
  function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const counterElement = document.querySelector(".cart-counter");

    if (counterElement) {
      counterElement.textContent = totalItems;
    }
  }

  // Actualizar el contador al cargar la página
  updateCartCounter();
});



// Renderizar el carrito en la página de carrito
document.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotalElement = document.getElementById("cart-total");
  const checkoutButton = document.getElementById("checkout-button");

  // Verificamos si estamos en la página del carrito
  if (!cartItemsContainer || !cartTotalElement || !checkoutButton) {
    console.warn(
      "Elementos del carrito no encontrados. Asegúrate de que estás en la página correcta."
    );
    return;
  }

  // Función para renderizar el carrito
  function renderCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || []; // Cargar el carrito desde localStorage
    cartItemsContainer.innerHTML = ""; // Limpiar el contenedor
    let total = 0;

    // Si el carrito está vacío
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <p class="text-center text-gray-500">
          Tu carrito está vacío. 
          <a href="index.html" class="text-yellow-400 underline">Ir a la tienda</a>
        </p>`;
      cartTotalElement.textContent = "€0.00"; // Mostrar total vacío
      return;
    }

    // Renderizar cada producto del carrito
    cart.forEach((item) => {
      const itemTotal = item.price * item.quantity; // Calcular subtotal
      total += itemTotal; // Acumular total

      const cartItem = document.createElement("div");
      cartItem.className =
        "flex justify-between items-center border-b border-gray-300 pb-4";

      cartItem.innerHTML = `
        <div class="flex items-center">
          <img src="${item.image}" alt="${
        item.name
      }" class="w-16 h-16 rounded-lg object-cover">
          <div class="ml-4">
            <h2 class="font-semibold">${item.name}</h2>
            <div class="text-sm text-gray-500">Cantidad: ${item.quantity}</div>
          </div>
        </div>
        <div class="text-right">
          <p class="font-semibold text-lg">€${itemTotal.toFixed(2)}</p>
          <button data-id="${
            item.id
          }" class="text-red-500 hover:underline remove-item">Eliminar</button>
        </div>
      `;

      cartItemsContainer.appendChild(cartItem); // Añadir al contenedor
    });

    cartTotalElement.textContent = `€${total.toFixed(2)}`; // Mostrar total del carrito
  }

  // Evento para eliminar un producto del carrito
  cartItemsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-item")) {
      const id = e.target.dataset.id; // Obtener ID del producto
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      cart = cart.filter((item) => item.id !== id); // Filtrar el producto eliminado
      localStorage.setItem("cart", JSON.stringify(cart)); // Actualizar localStorage
      renderCart(); // Re-renderizar el carrito
    }
  });

  // Evento para finalizar la compra
  checkoutButton.addEventListener("click", () => {
    alert("¡Gracias por tu compra!");
    localStorage.removeItem("cart"); // Vaciar el carrito en localStorage
    renderCart(); // Re-renderizar para mostrar el estado vacío
  });

  // Renderizar el carrito al cargar la página
  renderCart();
});

document.querySelector('.contact-link').addEventListener('click', function (event) {
  event.preventDefault(); // Evitar comportamiento predeterminado del enlace
  const contactForm = document.getElementById('contact-form');
  contactForm.classList.remove('hidden'); // Mostrar el formulario
  contactForm.scrollIntoView({ behavior: 'smooth' }); // Hacer scroll hacia el formulario
});


    document.querySelector('#persona-menu ul li a[href="contact.html"]').addEventListener('click', function (event) {
        event.preventDefault(); // Evitar que el enlace navegue a otra página

        // Ir al inicio de la página
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Mostrar el formulario de contacto después del desplazamiento al inicio
        setTimeout(() => {
            const contactForm = document.getElementById('contact-form');
            contactForm.classList.remove('hidden'); // Mostrar el formulario
            contactForm.scrollIntoView({ behavior: 'smooth' }); // Desplazar suavemente al formulario
        }, 500); // Esperar medio segundo antes de mostrar el formulario
    });


