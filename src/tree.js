class Tree {
  #selector = null;
  #params = null;
  #root = null;
  data = [];
  #level = 0; // 总层级
  constructor(selector, params) {
    this.#selector = selector;
    this.#params = params;
    this.init();
  }
  init() {
    this.#root = this.#query();
    this.data = this.#getData();
    this.#render();
  }
  /**
   *
   * @param {*} arr // 每次递归的数组
   * @param {*} level //当前层级
   * @param {*} tml   // 存总的html
   * @param {*} html  存每次循环的html
   * @param {*} path  上一次索引path
   * @returns
   */
  #transform(arr = this.data, level = 1, path = "", tml = "", html = "") {
    this.#level = level; // 总层级
    arr.forEach((item, index) => {
      //--- 设置属性 start
      item.$fullPath = ""; // 初始化$fullPath
      item.$level = level; // 当前层级
      item.$index = index; // 当前层级的第几个元素
      item.$fullPath += `${path}[${index}]`;
      // --- end
      const child = item?.children;
      if (child?.length > 0) {
        html = this.#transform(child, level + 1, `${item.$fullPath}.children`);
      }

      tml += this.#tml(item, html);
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
  #tml(item, html) {
    return `<ul class="nodes level-${item.$level}" id="nodes${item.$fullPath}">
    <li class="node">
      <div class="content">
        <button event="expand"   id="expand-${item.id}"  data-full-path="${item.$fullPath}" data-index="${item.$index}"  class="expand"   toggle="${item.expand}" ></button>
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
            this.#expand(target);
            break;
          case "checkbox":
            break;
          default:
            break;
        }
      },
      false
    );
  }

  #expand(target) {
    const fullPath = target.dataset["fullPath"];
    const fn = new Function(`return this.data${fullPath}`).bind(this)(); // 代替eval
    fn.expand = !fn.expand;
    console.log(fn);
  }
}
