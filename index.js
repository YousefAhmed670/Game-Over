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
                                <h3 class="h6 small text-white">${data[i].title}</h3>
                                <span class="badge text-bg-primary p-2">Free</span>
                            </div>
                            <p class="card-text small text-center opacity-50 text-white">
                                ${data[i].short_description}
                            </p>
                        </figcaption>
                    </div>
                    <footer class="card-footer small hstack justify-content-between text-white">
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
                <p class="small text-white">${data.description}</p>
                <a class="btn btn-outline-warning" target="_blank" href="${data.game_url}">Show Game</a>
            </div>
        `;
    document.getElementById("detailsContent").innerHTML = content;
  }
}

class Games {
  constructor() {
    this.ui = new Ui();
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
      options
    );
    const data = await response.json();

    this.ui.displayDataGame(data);
    this.attachEventListeners();
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
      options
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

document.addEventListener("DOMContentLoaded", () => {
  new Games();
  initNavbarToggle();
});
