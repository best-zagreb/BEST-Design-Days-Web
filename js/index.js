// ===== nav sections intersection observers =====

const navIntersectionUl = document.querySelectorAll(".nav__links > li");
let currentListItem = null;

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // console.log(entry.target);

        let currentSection = entry.target.getAttribute("id");

        // go through all nav items
        navIntersectionUl.forEach((listItem) => {
          if (
            listItem.firstChild.getAttribute("href") ===
            "#" + currentSection
          ) {
            // remove current-site attribute from last current nav item
            if (currentListItem)
              currentListItem.removeAttribute("data-current-site");

            // add current-site attribute to current nav item
            listItem.setAttribute("data-current-site", "");
            currentListItem = listItem;
          }
        });
      }
    });
  },
  { threshold: 0.75 }
);

document.querySelectorAll("section").forEach((section) => {
  sectionObserver.observe(section);
});

// ===== json nav sections (#) =====

const sections = document.querySelectorAll("section");
const sectionsIds = [];
sections.forEach((section) => sectionsIds.push(section.getAttribute("id")));

// ===== hero sections flipdown =====

// Unix timestamp (in seconds) to count down to
const eventStart = Math.round(new Date(2022, 09, 17, 16) / 1000); // 17th October 2022 at 4 pm in seconds

// Set up FlipDown
const flipdown = new FlipDown(eventStart, {
  headings: ["Dani", "Sati", "Minute", "Sekunde"],
});

// Start the countdown
flipdown.start();

// Do something when the countdown ends
flipdown.ifEnded(() => {
  console.log("Event ended!");
});

// ===== raspored & predavaci json data import =====

const rasporedTrTemplate = document.querySelector("[data-raspored-template]");
const rasporedTable = document.querySelector(".raspored-sec__table > tbody");

const predavacCardTemplate = document.querySelector("[data-predavac-template]");
const predavaciCarousel = document.querySelector(".predavaci-sec__cards");

const daniUTjednu = [
  "Nedjelja",
  "Ponedjeljak",
  "Utorak",
  "Srijeda",
  "Četvrtak",
  "Petak",
  "Subota",
];

function parseDateFormat(dateHrv) {
  // formatira datum iz DD.MM.YYYY. u YYYY, MM, DD za new Date() funkciju
  const dan = dateHrv.split(".")[0];
  const mjesec = dateHrv.split(".")[1];
  const godina = dateHrv.split(".")[2];

  return godina + ", " + mjesec + ", " + dan;
}

fetch("./data/aktivnosti.json")
  .then((res) => res.json())
  .then((data) => {
    data.map((aktivnost) => {
      const rasporedTrElement =
        rasporedTrTemplate.content.cloneNode(true).children[0];

      const rasporedDatumElement = rasporedTrElement.querySelector(
        ".raspored-sec__datum"
      );
      const rasporedVrijemeElement = rasporedTrElement.querySelector(
        ".raspored-sec__vrijeme"
      );
      const rasporedAktivnostElement = rasporedTrElement.querySelector(
        ".raspored-sec__aktivnost"
      );

      rasporedDatumElement.firstChild.innerText =
        daniUTjednu[new Date(parseDateFormat(aktivnost.datum)).getDay()] +
        " " +
        aktivnost.datum;
      rasporedVrijemeElement.firstChild.innerText = aktivnost.vrijeme;

      let aktivnostNaziv = aktivnost.tema;
      // ako postoji predavac za tu aktivnost
      if (aktivnost.predavaci[0].ime) {
        // ako postoji tvrtka iza te aktivnosti
        if (aktivnost.tvrtka) {
          aktivnostNaziv = ") - " + aktivnostNaziv;

          for (let index = 0; index < aktivnost.predavaci.length; index++) {
            if (index === 0) {
              aktivnostNaziv = aktivnost.predavaci[index].ime + aktivnostNaziv;
            } else {
              aktivnostNaziv =
                aktivnost.predavaci[index].ime + " & " + aktivnostNaziv;
            }
          }

          aktivnostNaziv = aktivnost.tvrtka + " (" + aktivnostNaziv;
        } else {
          for (let index = 0; index < aktivnost.predavaci.length; index++) {
            if (index === 0) {
              aktivnostNaziv =
                aktivnost.predavaci[index].ime + " - " + aktivnostNaziv;
            } else {
              aktivnostNaziv =
                aktivnost.predavaci[index].ime + " & " + aktivnostNaziv;
            }
          }
        }
      }
      rasporedAktivnostElement.firstChild.innerText = aktivnostNaziv;

      rasporedTable.append(rasporedTrElement);
    });

    return data;
  })
  .then((data) => {
    data.map((aktivnost) => {
      // ako je predavanje/radionica
      if (aktivnost.predavaci[0].ime) {
        aktivnost.predavaci.forEach((predavac) => {
          const predavacCardElement =
            predavacCardTemplate.content.cloneNode(true).children[0];

          const predavacImgElement = predavacCardElement.querySelector(
            ".predavaci-sec__img-container > img"
          );
          const predavacImeElement = predavacCardElement.querySelector(
            ".predavaci-sec__text-container > h4"
          );
          const predavacAktivnostElement = predavacCardElement.querySelector(
            ".predavaci-sec__text-container > h5"
          );

          if (predavac.imgUrl) {
            predavacImgElement.setAttribute("src", predavac.imgUrl);
          }
          predavacImgElement.setAttribute("alt", "Predavač " + predavac.ime);
          predavacImgElement.setAttribute("title", predavac.ime);
          predavacImeElement.innerText = aktivnost.tvrtka
            ? aktivnost.tvrtka + " (" + predavac.ime + ")"
            : predavac.ime;
          predavacAktivnostElement.innerText = aktivnost.tema;

          predavaciCarousel.append(predavacCardElement);
        });
      }
    });
  })
  .then(() => {
    // predavaci carousel functionality
    predavaciCards = document.querySelectorAll(".predavaci-sec__card");

    movePredavaciCarousel();
  })
  .catch((err) => {
    console.error(err);
  });

// ===== predavaci section carousel functionality =====

let predavaciCards;
const predavaciCarouselBtnLeft = document.querySelector(
  ".predavaci-sec__btn-left"
);
const predavaciCarouselBtnRight = document.querySelector(
  ".predavaci-sec__btn-right"
);

let predavacSlideCounter = 0;

function movePredavaciCarousel() {
  predavaciCarouselBtnLeft.removeAttribute("disabled");
  predavaciCarouselBtnRight.removeAttribute("disabled");

  predavaciCarousel.style.marginLeft =
    predavacSlideCounter * predavaciCards[0].getBoundingClientRect().width +
    "px";

  if (predavacSlideCounter === 0) {
    predavaciCarouselBtnLeft.setAttribute("disabled", "");
  }
  if (
    predavaciCards.length + predavacSlideCounter <=
    Math.floor(
      predavaciCarousel.getBoundingClientRect().width /
        predavaciCards[0].getBoundingClientRect().width
    )
  ) {
    predavaciCarouselBtnRight.setAttribute("disabled", "");
  }
}

predavaciCarouselBtnLeft.addEventListener("click", () => {
  predavacSlideCounter++;

  movePredavaciCarousel();
});
predavaciCarouselBtnRight.addEventListener("click", () => {
  predavacSlideCounter--;

  movePredavaciCarousel();
});

// ===== faqs json data import =====

const faqTemplate = document.querySelector("[data-faq-template]");
const faqsContainer = document.querySelector(".faq-sec__accordions-container");

fetch("./data/faqs.json")
  .then((res) => res.json())
  .then((data) => {
    data.map((faq) => {
      const faqElement = faqTemplate.content.cloneNode(true).children[0];

      const faqQuestionElement = faqElement.querySelector(
        ".faq-sec__question > p"
      );
      const faqAnswerElement = faqElement.querySelector(".faq-sec__answer");

      faqQuestionElement.innerText = faq.question;
      faqAnswerElement.innerText = faq.answer;

      faqsContainer.append(faqElement);
    });
  })
  .then(() => {
    // automatically close all other accordions when one is opened
    const accordions = document.querySelectorAll(".faq-sec__accordion");

    accordions.forEach((accordion) => {
      accordion.addEventListener("click", (event) => {
        accordions.forEach((accordionOther) => {
          if (
            accordion != accordionOther &&
            accordionOther.hasAttribute("open")
          ) {
            accordionOther.removeAttribute("open");

            // when clicking on question, open attribute gets auto added and breaks in case not if
            if (event.target === accordion) {
              accordion.setAttribute("open", "");
            }
          }
        });
      });
    });
  })
  .catch((err) => {
    console.error(err);
  });

// ===== organisers json data import and carousel logic =====

const orgsElement = document.querySelector(".organizatori");
const btnsElements = document.querySelectorAll(".org-btns-container > button");

// Set objects with references to the leftOrg, midOrg, and rightOrg elements
const leftOrg = {
  img: document.querySelectorAll(".org__img")[0],
  name: document.querySelectorAll(".org__name")[0],
  function: document.querySelectorAll(".org__function")[0],
};
const midOrg = {
  img: document.querySelectorAll(".org__img")[1],
  name: document.querySelectorAll(".org__name")[1],
  function1: document.querySelectorAll(".org__function")[1],
  function2: document.querySelector(".org__function2"),
};
const rightOrg = {
  img: document.querySelectorAll(".org__img")[2],
  name: document.querySelectorAll(".org__name")[2],
  function: document.querySelectorAll(".org__function")[2],
};

// Set duration of opacity transition
const transitionDuration = 0.5;
orgsElement.style.transition =
  orgsElement.style.transition + transitionDuration + "s";

let count = 0;
let orgData = null;
let timeoutId = null;

// Fetch data and start loop
async function getData() {
  const response = await fetch("data/organizacijskiTim.json");
  orgData = await response.json();

  // Update elements with data
  swapOrg();

  // Start loop that updates elements every 5 seconds
  timeoutId = setInterval(() => {
    count++;

    orgsElement.style.opacity = 0;
    setTimeout(() => {
      swapOrg();

      orgsElement.style.opacity = 1;
    }, 500);
  }, 5000);
}

// Update elements with data
function swapOrg() {
  // Get index of current
  let id = count % orgData.length;

  // Update elements for the leftOrg
  leftOrg.img.src = orgData[id].imgUrl;
  leftOrg.img.alt = orgData[id].ime;
  leftOrg.name.textContent = orgData[id].ime;
  leftOrg.function.textContent = orgData[id].funkcija;

  // Update elements for the midOrg
  id = (count + 1) % orgData.length;
  btnsElements.forEach((btnElement) => {
    btnElement.removeAttribute("active");
  });
  btnsElements[id].setAttribute("active", "true");
  midOrg.img.src = orgData[id].imgUrl;
  midOrg.img.alt = orgData[id].ime;
  midOrg.name.textContent = orgData[id].ime;
  midOrg.function1.textContent = orgData[id].funkcija;
  midOrg.function2.textContent = orgData[id].funkcija2;

  // Update elements for the rightOrg
  id = (count + 2) % orgData.length;
  rightOrg.img.src = orgData[id].imgUrl;
  rightOrg.img.alt = orgData[id].ime;
  rightOrg.name.textContent = orgData[id].ime;
  rightOrg.function.textContent = orgData[id].funkcija;
}

// Handle button click
btnsElements.forEach((btnElement, index) => {
  btnElement.addEventListener("click", () => {
    const newCount = (index + 3) % orgData.length;
    if (count !== newCount) {
      count = newCount;

      // Disable all buttons because of spam
      btnsElements.forEach((btn) => {
        btn.disabled = true;
      });

      orgsElement.style.opacity = 0;
      setTimeout(() => {
        // Update elements with data and fade in
        swapOrg();
        orgsElement.style.opacity = 1;

        // Enable all buttons
        setTimeout(() => {
          btnsElements.forEach((btn) => {
            btn.disabled = false;
          });
        }, 100);
      }, 500);
    }
  });
});

// Call initial function to fetch data
getData();

// ===== BDD partners json data import =====

const partnerTemplate = document.querySelector("[data-partner-template]");

const partnerImgsContainer = document.querySelector(
  ".partneri-sec__imgs-container"
);
const annualPartnersCarousel = document.querySelector(
  ".godisnji-partneri-sec__slider"
);

fetch("./data/partneri.json")
  .then((res) => res.json())
  .then((data) => {
    // add project partners
    Object.values(data.BDD).forEach((partnerLevel) => {
      const partnerRow = document.createElement("div");
      // each partner level in seperate row
      partnerLevel.forEach((partner) => {
        const partnerElement =
          partnerTemplate.content.cloneNode(true).children[0];
        partnerElement.setAttribute("href", partner.linkUrl);
        partnerElement.firstElementChild.setAttribute("src", partner.imgUrl);
        partnerElement.firstElementChild.setAttribute(
          "alt",
          partner.naziv + " partner logo"
        );
        partnerElement.firstElementChild.setAttribute(
          "title",
          partner.naziv + ""
        );
        partnerRow.append(partnerElement);
      });
      partnerImgsContainer.append(partnerRow);
    });

    return data;
  })
  .then((data) => {
    // add annual partners
    const partnersSlide = document.createElement("div");
    partnersSlide.classList.add("godisnji-partneri-sec__slide");
    Object.values(
      data.godisnji.map((partner) => {
        const partnerElement =
          partnerTemplate.content.cloneNode(true).children[0];
        partnerElement.setAttribute("href", partner.linkUrl);
        partnerElement.firstElementChild.setAttribute("src", partner.imgUrl);
        partnerElement.firstElementChild.setAttribute(
          "alt",
          partner.naziv + " partner logo"
        );
        partnerElement.firstElementChild.setAttribute("title", partner.naziv);
        partnersSlide.append(partnerElement);
      })
    );

    // 2 puta zbog nacina na koji carousel radi
    annualPartnersCarousel.append(partnersSlide);
    annualPartnersCarousel.append(partnersSlide.cloneNode(true));
  })
  .then(() => {
    // ===== annual partners carousel =====
    const slideElement = document.querySelector(
      ".godisnji-partneri-sec__slide"
    );
    const slideImgs = document.querySelectorAll(
      ".godisnji-partneri-sec__slide > a > img"
    );

    function slidePartnersSlider(numberOfItemsToSlide) {
      slideElement.style.marginLeft =
        "-" +
        numberOfItemsToSlide *
          annualPartnersCounter *
          slideImgs[0].getBoundingClientRect().width +
        "px";

      annualPartnersCounter++;
    }

    // initial slide for setting height = max height of all images
    annualPartnersCounter = slideImgs.length / 2 / numberOfItemsToSlide;
    slidePartnersSlider(numberOfItemsToSlide);

    slideElement.style.transition =
      "margin-left " + slideDuration + "ms" + " ease-out";

    let sliderIsPaused = false;
    setInterval(() => {
      if (!sliderIsPaused) {
        slidePartnersSlider(numberOfItemsToSlide);
      }
    }, pauseDuration + 50);

    // pause slider when hovering over
    slideElement.addEventListener("mouseenter", () => {
      sliderIsPaused = true;
    });
    slideElement.addEventListener("mouseleave", () => {
      sliderIsPaused = false;
    });

    slideElement.addEventListener("transitionend", (el) => {
      // check if transition is margin-left
      if (el.propertyName === "margin-left") {
        // needs to be bigger or equal (not just equal) because of some bug
        if (
          annualPartnersCounter >=
          slideImgs.length / 2 / numberOfItemsToSlide + 1
        ) {
          // set slide to start
          slideElement.style.transitionDuration = "1ms";
          slideElement.style.marginLeft = "0px";

          annualPartnersCounter = 1; // reset annualPartnersCounter
        } else {
          slideElement.style.transitionDuration = slideDuration + "ms";
        }
      }
    });
  })
  .catch((err) => {
    console.error(err);
  });

// ===== annual partners carousel =====

let annualPartnersCounter = 1; // counter for seamless infinite sliding

let numberOfItemsToSlide = 2; // must be <= number of items in carousel (slideImgs.length / 2)
let slideDuration = 1500; // in miliseconds
let pauseDuration = 3500; // must be >= slideDuration, in miliseconds

if (window.matchMedia("(max-width: 480px)").matches) {
  numberOfItemsToSlide = 1; // must be <= number of items in carousel
  slideDuration = 750; // in miliseconds
  pauseDuration = 2500; // must be >= slideDuration, in miliseconds
}

// ===== kontakt sections  =====

const kontaktTemplate = document.querySelector("[data-kontakt-template]");
const kontaktCards = document.querySelector(".kontakt-sec__cards");

// kontakt json data import
fetch("./data/organizacijskiTim.json")
  .then((res) => res.json())
  .then((data) => {
    // add organizacijski tim

    return data;
  })
  .then((data) => {
    data.map((organizator) => {
      if (organizator.kontakt === "da") {
        const kontaktCardElement =
          kontaktTemplate.content.cloneNode(true).children[0];

        const kontaktImgDivElement = kontaktCardElement.querySelector(
          ".kontakt-sec__card-image"
        );
        const kontaktFunkcijaElement = kontaktCardElement.querySelector(
          ".kontakt-sec__card-function"
        );
        const kontaktImeElement = kontaktCardElement.querySelector(
          ".kontakt-sec__card-name"
        );
        const kontaktLinkElements = kontaktCardElement.querySelectorAll(
          ".kontakt-sec__card-link"
        );

        let kontaktImageGradient = null;
        if (window.matchMedia("(max-width: 960px)").matches) {
          kontaktImageGradient =
            "linear-gradient(to right, #fff0 0%, #fff0 70%, whitesmoke 100%)";
        } else {
          kontaktImageGradient =
            "linear-gradient(#fff0 0%, #fff0 70%, whitesmoke 100%)";
        }
        if (!organizator.imgUrl) {
          organizator.imgUrl = "./img/questionmark-icon.svg";
          kontaktImgDivElement.style.backgroundSize = "33%";
        }
        kontaktImgDivElement.style.backgroundImage =
          kontaktImageGradient + ", url(" + organizator.imgUrl + ")";
        kontaktImgDivElement.setAttribute(
          "title",
          organizator.funkcija + " " + organizator.ime
        );

        kontaktFunkcijaElement.innerText = organizator.funkcija;

        kontaktImeElement.innerText = organizator.ime;

        if (organizator.email) {
          kontaktLinkElements[0].setAttribute(
            "href",
            "mailto:" + organizator.email
          );
          kontaktLinkElements[0].innerText = organizator.email;
        }
        if (organizator.tel) {
          kontaktLinkElements[1].setAttribute(
            "href",
            "tel:" + organizator.tel.replace(/\s/g, "")
          );
          kontaktLinkElements[1].innerText = organizator.tel;
        }

        kontaktCards.append(kontaktCardElement);
      }
    });
  })
  .then(() => {
    addVanillaTitlToKontaktCard();
  })
  .then(() => {
    // if url with specified section (#something)
    if (sectionsIds.includes(window.location.hash.split("#")[1]))
      document
        .querySelector('[id="' + window.location.hash.split("#")[1] + '"]')
        .scrollIntoView(true);
  })
  .catch((err) => {
    console.error(err);
  });

// cards tilt

function isTouchDevice() {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

function addVanillaTitlToKontaktCard() {
  if (!isTouchDevice()) {
    VanillaTilt.init(document.querySelectorAll(".kontakt-sec__card"), {
      glare: true,
      reverse: true,
      "max-glare": 0.75,
    });
  }
}
