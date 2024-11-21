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

      // Rellenar la plantilla con los datos del producto
      productContent.querySelector(".name").textContent = product.name;
      productContent.querySelector(".price").textContent = `$${product.price}`;
      productContent.querySelector(".image").src = product.image;
      productContent.querySelector(
        ".link"
      ).href = `./product.html?id=${product.id}`;

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
      this.querySelector(".price").textContent = `$${product.price}`;
      this.querySelector(".description").textContent = product.description;

      // Crear un contenedor para las características adicionales
      const featuresContainer = document.createElement("div");
      featuresContainer.classList.add("features", "mt-4");

      // Añadir propiedades básicas del producto como características adicionales
      for (const [key, value] of Object.entries(product)) {
        if (!["id", "name", "price", "image", "description", "features"].includes(key)) {
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

    console.log("Producto renderizado correctamente");
  }
}

customElements.define("custom-product", CustomProduct);
