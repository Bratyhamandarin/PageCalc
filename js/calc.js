const totalPrice = document.querySelector(".totalPrice");
const coverPagesNode = document.querySelector(".coverPages");
const uncolorPagesTotalNode = document.querySelector(".uncolorPages_total");
const uncolorPagesNode = document.querySelector(".uncolorPages");
const colorPagesTotalNode = document.querySelector(".colorPages_total");
const colorPagesNode = document.querySelector(".colorPages");
//get our modal with data
const modal = document.querySelector(".modal");
// cost of no color pages
const uncolor = {
  to300: 10,
  to500: 8,
  to1000: 7,
  to2000: 6,
  tomore: 5
};

// cost of color pages
const color = {
  to25: 50,
  to50: 46,
  to100: 44,
  to300: 34,
  to500: 30,
  tomore: 24
};

// cost of postprint
const post = {
  to25: 15,
  to50: 10,
  tomore: 5
};

// cost of cover
const cover = {
  color: 12,
  uncolor: 11
};

// cost of preprint
const preprint = 500;

modal.addEventListener("submit", e => {
  e.preventDefault();
  const form = new FormData(modal);
  const buffer = {};
  // parse data from form
  for (let pair of form.entries()) {
    buffer[pair[0]] = pair[1];
  }

  // get color pages
  let pages = getCalcConfig(buffer);
  // get cost of color pages
  const colorPagesCost = colorCost(pages.colPagesA4, buffer.total);
  // get cost of uncolor pages
  const uncolorPagesCost = uncolorCost(pages.uncolorPagesA4, buffer.total);
  // get cost of postprint
  const postprintCost = printCost(buffer.total);
  // get cost of cover
  const coverCost = (buffer.cover == 1 ? cover.uncolor : cover.color) * buffer.total;
  // get total cost
  const total = colorPagesCost + uncolorPagesCost + postprintCost + coverCost + preprint;
  totalPrice.textContent = `${total} рублей`;

  coverPagesNode.textContent = pages.pagesCollection[0].a5Pages.join(", ");

  // get uncolor pages A5
  let uncolorPagesA5 = [];
  pages.uncolorPagesA4.forEach(page => {
    uncolorPagesA5 = uncolorPagesA5.concat(pages.pagesCollection[page - 1].a5Pages);
  });
  uncolorPagesA5.sort((a, b) => a - b);
  uncolorPagesTotalNode.textContent = `ЧБ (всего ${pages.uncolorPagesA4.length})`;
  uncolorPagesNode.textContent = getRangedArray(uncolorPagesA5).join(", ");

  // get color pages A5
  let colorPagesA5 = [];
  pages.colPagesA4.forEach(page => {
    colorPagesA5 = colorPagesA5.concat(pages.pagesCollection[page - 1].a5Pages);
  });
  colorPagesA5.sort((a, b) => a - b);
  colorPagesTotalNode.textContent = `Цветные (всего ${pages.colPagesA4.length})`;
  colorPagesNode.textContent = getRangedArray(colorPagesA5).join(", ");
});

function getCalcConfig(obj) {
  // number of a5 pages
  let totalA5 = 4 * Math.ceil(+obj.pages / 4);
  // number of a4 pages
  let totalA4 = totalA5 / 4,
    a5Pages = Array.from({ length: totalA5 }, (v, k) => k + 1);

  let colPagesА5 = obj.colorPages
    .split(",")
    .map(num => num.trim())
    .filter(item => item)
    .filter(item => {
      return (
        item !== "1" &&
        item !== "2" &&
        item !== a5Pages[a5Pages.length - 1].toString() &&
        item !== a5Pages[a5Pages.length - 2].toString() &&
        item < totalA5
      );
    });

  let currA4Page = 1,
    pages = [];

  // generate Array with pages a4
  for (let i = 0; i < totalA4; i++) {
    let currentA4Number = i + 1;
    pages.push({
      a4Page: i + 1,
      a5Pages: a5Pages.splice(0, 2).concat(a5Pages.splice(a5Pages.length - 2, 2))
    });
  }

  let colPagesA4 = [];
  // parse color a5 pages
  colPagesА5.forEach(page => {
    let buffer;
    if (page >= totalA5 / 2) {
      buffer = (page - totalA5 / 2) / 2;
      if (buffer == 0) {
        colPagesA4.push(totalA4 - buffer);
      } else {
        Number.isInteger(buffer)
          ? colPagesA4.push(totalA4 - buffer + 1)
          : colPagesA4.push(totalA4 - Math.floor(buffer));
      }
    } else {
      buffer = page / 2;
      Number.isInteger(buffer) ? colPagesA4.push(buffer) : colPagesA4.push(Math.ceil(buffer));
    }
  });

  // remove all repeated pages
  colPagesA4 = new Set(colPagesA4);

  let A4pages = Array.from({ length: totalA4 }, (v, k) => k + 1);
  let uncolorPagesA4 = [];

  // get uncolor pages
  A4pages.forEach(page => {
    !colPagesA4.has(page) && uncolorPagesA4.push(page);
  });

  return {
    colPagesA4: [...colPagesA4],
    uncolorPagesA4,
    pagesCollection: pages
  };
}

function colorCost(allPages, total) {
  let pages = total * allPages.length;
  let colorCostTotal;
  switch (true) {
    case pages <= 25:
      colorCostTotal = color.to25 * pages;

      break;
    case pages <= 50:
      colorCostTotal = color.to50 * pages;

      break;
    case pages <= 100:
      colorCostTotal = color.to100 * pages;

      break;
    case pages <= 300:
      colorCostTotal = color.to300 * pages;

      break;
    case pages <= 500:
      colorCostTotal = color.to500 * pages;

      break;

    default:
      colorCostTotal = color.cmore * pages;
      break;
  }
  return colorCostTotal;
}

function uncolorCost(allPages, total) {
  let pages = total * allPages.length;
  let uncolorCostTotal;
  switch (true) {
    case pages <= 300:
      uncolorCostTotal = uncolor.to300 * pages;

      break;
    case pages <= 500:
      uncolorCostTotal = uncolor.to500 * pages;

      break;
    case pages <= 1000:
      uncolorCostTotal = uncolor.to1000 * pages;

      break;
    case pages <= 2000:
      uncolorCostTotal = uncolor.to2000 * pages;

      break;

    default:
      uncolorCostTotal = uncolor.tomore * pages;
      break;
  }
  return uncolorCostTotal;
}

function printCost(total) {
  let postCost;
  switch (true) {
    case total <= 25:
      postCost = post.to25 * total;

      break;
    case total <= 50:
      postCost = post.to50 * total;

      break;

    default:
      postCost = post.tomore * total;
      break;
  }
  return postCost;
}

function getRangedArray(arr) {
  const bufferArray = [];

  arr.forEach((number, index) => {
    if (index === 0) {
      bufferArray.push([number]);
    } else if (number - arr[index - 1] === 1) {
      bufferArray[bufferArray.length - 1].push(number);
    } else {
      bufferArray.push([number]);
    }
  });

  return bufferArray.map(
    (numberArray, index) =>
      numberArray.length > 1 ? `${numberArray[0]}-${numberArray[numberArray.length - 1]}` : numberArray[0]
  );
}
