class Tree {
  #selector = null;
  #params = null;
  #root = null;
  #data = [];
  #level = 0; // 总层级
  constructor(selector, params) {
    this.#selector = selector;
    this.#params = params;
    this.init();
  }
  init() {
    this.#root = this.#query();
    this.#data = this.#getData();
    this.#render();
  }
  /**
   *
   * @param {*} arr // 每次递归的数组
   * @param {*} level //当前层级
   * @param {*} tml   // 存总的html
   * @param {*} html  存每次循环的html
   * @returns
   */
  #transform(arr = this.#data, level = 1, tml = "", html = "") {
    this.#level = level; // 总层级
    arr.forEach((item, index) => {
      //--- 设置属性 start
      item.level = level; // 当前层级
      item.index = `${this.#level}-${index}`;
      // --- end
      const child = item?.children;
      child?.length > 0 && (html = this.#transform(child, level + 1));
      tml += this.#tml(item, index, html);
    });
    return tml;
  }
  #render() {
    this.#root.innerHTML = this.#transform();
    this.#on(this.#root, "click");
  }
  #getData() {
    const data = this.#params?.data?.[0]?.children;
    if (data) {
      return this.#params.data;
    }
    throw "数据结构不对";
  }
  #query() {
    if (!this.#selector) return document.querySelector("body");
    if (typeof this.#selector === "string")
      return document.querySelector(this.#selector);
    return this.#selector;
  }
  #tml(item, index, html) {
    return `<ul class="nodes level-${item.level}">
    <li class="node ${item.index}">
      <div class="content">
        <button event="expand"   id="expand-${item.id}"   class="expand"   toggle="${item.expand}" ></button>
        <button event="checkbox" id="checkbox-${item.id}" class="checkbox" toggle="${item.checked}"></button>
        <label  for="checkbox-${item.id}"> ${item.label} </label>
      </div>

      ${html}

    </li>
  </ul>`;
  }

  //--- 事件
  #on(observer, eventType) {
    observer.addEventListener(
      eventType,
      (e) => {
        const target = e.target || e.srcElement; //target就是当前对象
        const eventId = target.getAttribute("event");
        switch (eventId) {
          case "expand":
            console.log(eventId);
            break;
          case "checkbox":
            console.log(eventId);
            break;
          default:
            break;
        }
      },
      false
    );
  }
}
