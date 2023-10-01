Vue.component("v_select", VueSelect.VueSelect);

Vue.prototype.$items = ITEMS;

Vue.directive("uppercase", {
    update: function (el) {
        el.value = el.value.toUpperCase()
    }
});

let vueInstance = new Vue({
    el: '#app',
    data: {
    },
});
