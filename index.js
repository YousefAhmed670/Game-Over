class Ui {
  displayDataGame(data) {
    let content = ``;
    for (let i = 0; i < data.length; i++) {
      content += `<div class="col">
                <div data-id="${data[i].id}" class="card h-100 bg-transparent" role="button">
                    <div class="card-body">
                        <figure class="position-relative">
                            <img class="card-img-top object-fit-cover h-100" src="${data[i].thumbnail}" />
                        </figure>
                        <figcaption>
                            <div class="hstack justify-content-between">
                                <h3 class="h6 small ">${data[i].title}</h3>
                                <span class="badge text-bg-primary p-2">Free</span>
                            </div>
                            <p class="card-text small text-center opacity-50 ">
                                ${data[i].short_description}
                            </p>
                        </figcaption>
                    </div>
                    <footer class="card-footer small hstack justify-content-between ">
                        <span class="badge badge-color">${data[i].genre}</span>
                        <span class="badge badge-color">${data[i].platform}</span>
                    </footer>
                </div>
            </div>`;
      document.getElementById("gameData").innerHTML = content;
    }
  }

  displayDetails(data) {
    const content = `
            <div class="col-md-4">
                <img src="${data.thumbnail}" class="w-100" alt="image details" />
            </div>
            <div class="col-md-8">
                <h3>Title: ${data.title}</h3>
                <p>Category: <span class="badge text-bg-info">${data.genre}</span></p>
                <p>Platform: <span class="badge text-bg-info">${data.platform}</span></p>
                <p>Status: <span class="badge text-bg-info">${data.status}</span></p>
                <p class="small ">${data.description}</p>
                <a class="btn btn-outline-warning" target="_blank" href="${data.game_url}">Show Game</a>
            </div>
        `;
    document.getElementById("detailsContent").innerHTML = content;
  }
}

/* ============================================
   PAGINATION — Reusable client-side component
   ============================================ */
class Pagination {
  constructor({ itemsPerPage = 20, containerSelector, onPageChange }) {
    this.itemsPerPage = itemsPerPage;
    this.container = document.querySelector(containerSelector);
    this.onPageChange = onPageChange;
    this.currentPage = 1;
    this.allItems = [];
    this.totalPages = 1;
  }

  /** Feed new data and reset to page 1 */
  setData(items) {
    this.allItems = items;
    this.totalPages = Math.ceil(items.length / this.itemsPerPage);
    this.currentPage = 1;
    this._emit();
    this.renderControls();
  }

  /** Get the slice for the current page */
  getPageItems() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.allItems.slice(start, start + this.itemsPerPage);
  }

  /** Navigate to a specific page */
  goToPage(page) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this._emit();
    this.renderControls();
    // Smooth scroll to top of cards
    document
      .getElementById("gameData")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /** Emit the page-change callback */
  _emit() {
    if (this.onPageChange) {
      this.onPageChange(this.getPageItems(), this.currentPage, this.totalPages);
    }
  }

  /** Build Previous / page numbers / Next buttons */
  renderControls() {
    if (!this.container) return;

    // Hide pagination if only 1 page
    if (this.totalPages <= 1) {
      this.container.innerHTML = "";
      return;
    }

    let html = "";

    // Previous button
    html += `<button class="page-btn" data-page="prev" ${this.currentPage === 1 ? "disabled" : ""}>&laquo; Prev</button>`;

    // Page number buttons (with ellipsis for large page counts)
    const pages = this._getVisiblePages();
    for (const p of pages) {
      if (p === "...") {
        html += `<span class="page-btn" style="pointer-events:none;opacity:0.5">…</span>`;
      } else {
        html += `<button class="page-btn ${p === this.currentPage ? "active" : ""}" data-page="${p}">${p}</button>`;
      }
    }

    // Next button
    html += `<button class="page-btn" data-page="next" ${this.currentPage === this.totalPages ? "disabled" : ""}>Next &raquo;</button>`;

    this.container.innerHTML = html;

    // Attach click listeners
    this.container.querySelectorAll(".page-btn[data-page]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = btn.dataset.page;
        if (val === "prev") this.goToPage(this.currentPage - 1);
        else if (val === "next") this.goToPage(this.currentPage + 1);
        else this.goToPage(Number(val));
      });
    });
  }

  /** Determine which page numbers to show */
  _getVisiblePages() {
    const total = this.totalPages;
    const current = this.currentPage;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages = [];
    pages.push(1);
    if (current > 3) pages.push("...");
    for (
      let i = Math.max(2, current - 1);
      i <= Math.min(total - 1, current + 1);
      i++
    ) {
      pages.push(i);
    }
    if (current < total - 2) pages.push("...");
    pages.push(total);
    return pages;
  }
}

/* ============================================
   GAMES — Extended with pagination support
   ============================================ */
class Games {
  constructor() {
    this.ui = new Ui();
    this.allGames = [];

    // Initialize pagination component
    this.pagination = new Pagination({
      itemsPerPage: 20,
      containerSelector: "#paginationNav",
      onPageChange: (pageItems) => {
        this.ui.displayDataGame(pageItems);
        this.attachEventListeners();
      },
    });

    this.getGames("mmorpg");
    this.chooseCategory();
  }

  chooseCategory() {
    document.querySelectorAll(".menu a").forEach((ele) => {
      ele.addEventListener("click", (e) => {
        document.querySelector(".menu .active").classList.remove("active");
        e.target.classList.add("active");
        this.getGames(e.target.dataset.category);
      });
    });

    document.getElementById("btnClose").addEventListener("click", () => {
      this.closeDetails();
    });
  }

  async getGames(category) {
    this.toggleLoading(true);
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": "761b8a3226msh868f0d927cb6ea4p117ef0jsn46d63d281712",
        "X-RapidAPI-Host": "free-to-play-games-database.p.rapidapi.com",
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
    const response = await fetch(
      `https://free-to-play-games-database.p.rapidapi.com/api/games?category=${category}`,
      options,
    );
    const data = await response.json();

    // Store all games and feed into pagination
    this.allGames = data;
    this.pagination.setData(data);
    this.toggleLoading(false);
  }

  attachEventListeners() {
    document.querySelectorAll(".card").forEach((item) => {
      item.addEventListener("click", () => {
        const id = item.dataset.id;
        this.showDetails(id);
      });
    });
  }

  async showDetails(id) {
    this.toggleLoading(true);
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": "761b8a3226msh868f0d927cb6ea4p117ef0jsn46d63d281712",
        "X-RapidAPI-Host": "free-to-play-games-database.p.rapidapi.com",
      },
    };
    const response = await fetch(
      `https://free-to-play-games-database.p.rapidapi.com/api/game?id=${id}`,
      options,
    );
    const data = await response.json();

    this.ui.displayDetails(data);
    document.querySelector(".games").classList.add("d-none");
    document.querySelector(".details").classList.remove("d-none");
    this.toggleLoading(false);
  }

  closeDetails() {
    document.querySelector(".details").classList.add("d-none");
    document.querySelector(".games").classList.remove("d-none");
  }

  toggleLoading(isLoading) {
    const loading = document.querySelector(".loading");
    if (isLoading) {
      loading.classList.remove("d-none");
    } else {
      loading.classList.add("d-none");
    }
  }
}

/* ============================================
   THEME TOGGLE — localStorage + system pref
   ============================================ */
function initThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  const root = document.documentElement;

  // Determine initial theme: localStorage → system preference → default dark
  const stored = localStorage.getItem("theme");
  if (stored) {
    root.dataset.theme = stored;
  } else {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    root.dataset.theme = prefersDark ? "dark" : "light";
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      localStorage.setItem("theme", next);
    });
  }
}

/* ============================================
   NAVBAR TOGGLE — manual Bootstrap collapse
   ============================================ */
function initNavbarToggle() {
  const toggler = document.querySelector(".navbar-toggler");
  const targetSelector = toggler?.getAttribute("data-bs-target");
  if (!toggler || !targetSelector) {
    return;
  }

  const target = document.querySelector(targetSelector);
  if (!target) {
    return;
  }

  let collapseInstance = null;
  if (typeof bootstrap !== "undefined" && bootstrap.Collapse) {
    collapseInstance = new bootstrap.Collapse(target, { toggle: false });
  }

  toggler.addEventListener("click", () => {
    if (collapseInstance) {
      collapseInstance.toggle();
      return;
    }
    target.classList.toggle("show");
  });
}

/* ============================================
   INIT
   ============================================ */
document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  new Games();
  initNavbarToggle();
});
