Vue.component('sales_client', {
    template: `
        <section class="v_active_sale_container">
            <div class="v_active_sale_container_body">

                <section class="sales-client-fill-bill-container" v-if="fillingBill">
                    <div class="w100">
                        <table class="table table-condensed">
                            <thead style="font-size:11px">
                                <tr>
                                    <th style="width:calc(100% - 120px)"></th>
                                    <th style="width:60px">USD</th>
                                    <th style="width:60px">BS</th>
                                    <th style="width:60px">Gr</th>
                                </tr>
                            </thead>
                            <tbody style="font-size:11px">
                                <tr>
                                    <td>Total actual</td>
                                    <td>{{ totals.usd.toFixed(2) }}</td>
                                    <td>{{ totals.bs.toFixed(2) }}</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td>Por completar</td>
                                    <td>{{ fillingTotals.usd }}</td>
                                    <td>{{ fillingTotals.bs }}</td>
                                    <td>{{ fillingQty }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                        <input type="number" class="form-control m_b w200p" placeholder="USD" v-model="fillingUsd" @keyup="setFillingUsd()">
                        <input type="number" class="form-control m_b w200p" placeholder="BS" v-model="fillingBs" @keyup="setFillingBs()">
                        <div class="fl">
                            <button class="btn btn-default m_r" @click="fillingBill = false">Cancelar</button>
                            <button class="btn btn-primary" @click="fillBill()">Completar</button>
                        </div>
                </section>

                <!--*****   INPUTS   *****-->

                <div class="fl">
                    <v_select
                    v-model="item"
                    autocomplete="off"
                    :options="items"
                    placeholder="Produto"
                    style="margin-bottom:5px; width:100%;"
                    @option:selected="selectedItem"
                    label="name"
                    ref="item"
                    :disabled="!validDollar"
                    >
                            <template slot="option" slot-scope="option">
                                {{ option.name }}
                            </template>
                            <template slot="selected-option" slot-scope="option">
                                {{ option.name }}
                            </template>
                    </v_select>
                    <button :disabled="!body.length || !item || item.unit != 'g'" class="btn btn-default btn_select" @click="fillingBill = true"><i class="fa-solid fa-money-bill-trend-up fa-fw"></i></button>
                </div>
                <div class="fl">
                    <input ref="qty" :disabled="item.unit == 's' || !validDollar" type="number" min="0.1" step=".1" class="form-control m_r" placeholder="Cantidad" v-model="qty" @keyup="setQty()" >
                    <input ref="usd" :disabled="item.unit == 'u' || !validDollar" type="number" min="0.1" step=".1" class="form-control m_r" placeholder="USD" v-model="usd" @keyup="setUsd()" >
                    <input :disabled="item.unit == 'u' || !validDollar" type="number" min="0.1" step=".1" class="form-control" placeholder="BS" v-model="bs"  @keyup="setBs()" >
                    <button :disabled="!validDollar" style="34px" class="btn btn-default btn_select" @click="addNewItemToShoppingList()"><i class="fa-solid fa-plus fa-fw"></i></button> 
                </div>
                
                <!--*****   BODY   *****-->

                <div class="sales-client-table-container">

                <div class="download-from-memory-container" v-if="!body.length && $root.onLine" @click="downloadFromMemory = true">
                    <i class="fa-solid fa-cloud-arrow-down"></i>
                </div>

                    <table class="table">
                        <thead style="font-size:10px">
                            <tr>
                                <th style="width:15px; font-size:18px"></th>
                                <th style="width:calc(100% - 195px)">Producto</th>
                                <th style="width:50px">Qty.</th>
                                <th style="width:50px">USD</th>
                                <th style="width:50px">BS</th>
                                <th style="width:15px; font-size:18px"><i class="fa-solid fa-square-minus fa-xl pointer" @click="clearAllItems()"></i></th>
                            </tr>
                        </thead>
                        <tbody style="font-size:10px">
                            <tr v-for="i, index in body">
                                <td style="font-size:18px;" v-if="i.item.can_jar == '1'" :style="i.item.jared ? 'color: var(--green)' : 'color: #555' " @click="i.item.jared = !i.item.jared">
                                    <i class="fa-solid fa-jar" style=""></i>
                                </td>
                                <td style="font-size:18px;" v-else></td>
                                <td v-if="i.item.has_details === '1'" @click="showDetailModal = true; showingItem = i" class="has_details">{{ i.name }} 
                                    <span v-if="i.item.jared">(FR)</span>
                                </td>
                                <td v-else>{{ i.name }} 
                                    <span v-if="i.item.jared">(FR)</span>
                                </td>
                                <td>{{ parseFloat(i.qty).toFixed(0) }}{{i.unit}}</td>
                                <td v-if="i.item.jared">{{ (parseFloat(i.usd) + jarPrice).toFixed(2) }}</td>
                                <td v-else>{{ parseFloat(i.usd).toFixed(2) }}</td>
                                <td v-if="i.item.jared">{{ ((parseFloat(i.usd) + jarPrice) * dollar).toFixed(2) }}</td>
                                <td v-else>{{ parseFloat(i.bs).toFixed(2) }}</td>
                                <td style="font-size:18px">
                                    <i class="fa-solid fa-square-minus fa-xl pointer" @click="clearOneItem(index)"></i>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="sales-client-table-total-wrapper top-border">
                    <div class="sales-client-table-total">
                        <div>Sub total:</div><div>{{parseFloat(totals.usd).toFixed(2)}} $</div><div>{{parseFloat(totals.bs).toFixed(2)}} Bs</div>
                    </div>
                    <div class="sales-client-table-total">
                        <div>Descuento<span v-if="usingCupon"> ({{(client.cupon_number * 100).toFixed(0)}}%)</span>:</div><div>{{parseFloat(discounts.usd).toFixed(2)}} $</div><div>{{parseFloat(discounts.bs).toFixed(2)}} Bs</div>
                    </div>
                    <div class="sales-client-table-total">
                        <div>Total:</div><div>{{parseFloat(totals.usd - discounts.usd).toFixed(2)}} $</div><div>{{parseFloat(totals.bs - discounts.bs).toFixed(2)}} Bs</div>
                    </div>
                </div>

                <!--*****   CONTROLS   *****-->
                <div class="sales-client-control-line fl">
                    <div class="fl">
                        <button @click="copyAllItems()" class="btn btn-default m_r" :disabled="!body.length">
                            <i class="fa-solid fa-copy"></i>
                        </button>
                        <input type="number" class="form-control m_r" placeholder="Dolar" v-model="dollar" @keyup="setDollarInLocalStorage">
                    </div>                   
                </div>

            </div>

            <!--*****   MODALS   *****-->
            <items-details v-if="showDetailModal" @close="showDetailModal = false" :item="showingItem"></items-details>
        </section>
    `,
    data() {
        return {
            items: this.$items,
            clients: [],

            item: '',
            qty: '',
            bs: '',
            usd: '',
            client: '',

            body: [],

            dollar: '',

            fillingBs: '',
            fillingUsd: '',
            fillingQty: '',

            jarPrice: 1.5,

            usingCupon: false,

            fillingBill: false,
            showDetailModal: false,
            showingItem: null,
        }
    },

    created(){
        this.getDollarFromLocalStorage();
    },

    methods: {
        getDollarFromLocalStorage(){
            this.dollar = localStorage.getItem('scs_static_dollar');
        },
        setDollarInLocalStorage(){
            if(this.validDollar) localStorage.setItem('scs_static_dollar', this.dollar);
        },
        fillBill(){
            this.body.push({name: this.item.name, qty: this.fillingQty, bs: this.fillingTotals.bs, usd: this.fillingTotals.usd, unit: this.item.unit, item:{...this.item}});
            this.item = '';
            this.usd = this.bs = this.qty = this.fillingBs = this.fillingUsd = this.fillingQty = '';
            this.fillingBill = false;
        },

        setFillingUsd(){
            this.fillingBs = (parseFloat(this.fillingUsd) * parseFloat(this.dollar)).toFixed(2);
            this.setFillingQty(parseFloat(this.fillingUsd) - this.totals.usd);
        },

        setFillingBs(){
            this.fillingUsd = (parseFloat(this.fillingBs) / this.dollar).toFixed(2);
            this.setFillingQty(parseFloat(this.fillingUsd) - this.totals.usd);
        },

        setFillingQty(usd){
            let qty = 0;

            if (parseFloat(usd) < parseFloat(this.item.price100)) {
                qty = (parseFloat(usd) / (parseFloat(this.item.price50) / 50));
            } else if (parseFloat(usd) < parseFloat(this.item.price1000)) {
                qty = (parseFloat(usd) / (parseFloat(this.item.price100) / 100));
            } else {
                qty = (parseFloat(usd) / (parseFloat(this.item.price1000) / 1000));
            }

            
            this.fillingQty = isNaN(qty) ? 0 : qty.toFixed(2);
        },

        setQty() {
            if(!this.item){
                this.qty = 0;
                return;
            }

            if(this.item.unit == 'u'){
                this.qty = 1;
                this.usd = parseFloat(this.item.price1000);
                this.bs = this.usd * this.dollar;
                return;
            }

            if (this.item) {
                if (parseFloat(this.qty) <= 99) {
                    this.usd = (parseFloat(this.qty) * (parseFloat(this.item.price50) / 50)).toFixed(2);
                } else if (parseFloat(this.qty) <= 999) {
                    this.usd = (parseFloat(this.qty) * (parseFloat(this.item.price100) / 100)).toFixed(2);
                } else {
                    this.usd = (parseFloat(this.qty) * (parseFloat(this.item.price1000) / 1000)).toFixed(2);
                }
                this.bs = (parseFloat(this.usd) * parseFloat(this.dollar)).toFixed(2);
            }
        },

        setUsd() {
            if(!this.item){
                this.usd = '';
                return;
            }

            if (this.item) {
                if (parseFloat(this.usd) < parseFloat(this.item.price100)) {
                    this.qty = (parseFloat(this.usd) / (parseFloat(this.item.price50) / 50)).toFixed(2);
                } else if (parseFloat(this.usd) < parseFloat(this.item.price1000)) {
                    this.qty = (parseFloat(this.usd) / (parseFloat(this.item.price100) / 100)).toFixed(2);
                } else {
                    this.qty = (parseFloat(this.usd) / (parseFloat(this.item.price1000) / 1000)).toFixed(2);
                }
            }

            if(this.item.unit == 's') this.qty = 1;

            this.bs = (parseFloat(this.usd) * parseFloat(this.dollar)).toFixed(2);
        },

        setBs() {
            if(!this.item){
                this.bs = '';
                return;
            }

            let usdPrice = parseFloat(this.bs) / this.dollar;

            if (this.item) {
                if (parseFloat(usdPrice) < parseFloat(this.item.price100)) {
                    this.qty = (parseFloat(usdPrice) / (parseFloat(this.item.price50) / 50)).toFixed(2);
                } else if (parseFloat(usdPrice) < parseFloat(this.item.price1000)) {
                    this.qty = (parseFloat(usdPrice) / (parseFloat(this.item.price100) / 100)).toFixed(2);
                } else {
                    this.qty = (parseFloat(usdPrice) / (parseFloat(this.item.price1000) / 1000)).toFixed(2);
                }
            }

            if(this.item.unit == 's') this.qty = 1;

            this.usd = usdPrice.toFixed(2);
        },

        normalizeString(str){
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        },

        addNewItemToShoppingList() {
            if(parseFloat(this.usd) != '' && !isNaN(parseFloat(this.usd))){
                this.body.push({name: this.item.name, qty: this.qty, bs: this.bs, usd: this.usd, unit: this.item.unit, item:{...this.item}});
                this.item = '';
                this.usd = this.bs = this.qty = '';
            }
        },

        addCuponToShoppingList(cupon){
            this.body.push({name: 'Descuento ' + (cupon * 100) + '%' , qty: 1, bs: 0, usd: 0, unit: ''});
        },

        selectedItem() {
            this.qty = '';
            this.usd = '';
            this.bs = '';
           
        },

        clearAllItems(){
            if(this.body.length){
                if(confirm('Seguro que desea eliminar todos los items de esta venta?')){
                    this.body.splice(0);
                }
            }
        },

        clearOneItem(index){
            this.body.splice(index,1);
        },

        copyAllItems() {
            let text = ""

            this.body.forEach(element => {
                if(element.item.jared){
                    text += `_${parseFloat(element.qty).toFixed(0)}${element.unit}_ ${element.name} (FR) *${(parseFloat(element.usd) + this.jarPrice).toFixed(2)}$*\n`;
                }else{
                    text += `_${parseFloat(element.qty).toFixed(0)}${element.unit}_ ${element.name} *${parseFloat(element.usd).toFixed(2)}$*\n`;
                }
            });

            if(this.usingCupon || this.staticCupon) text += `\n*Sub total:* ${this.totals.usd.toFixed(2)}$ = ${this.totals.bs.toFixed(2)}Bs`;
            if(this.usingCupon)  text += `\n*Descuento:* ${this.discounts.usd.toFixed(2)}$ = ${this.discounts.bs.toFixed(2)}Bs`;
            if(this.staticCupon)  text += `\n*⭐​Cliente especial​:* ${this.discounts.usd.toFixed(2)}$ = ${this.discounts.bs.toFixed(2)}Bs`;
            text += `\n*Total:* ${(this.totals.usd - this.discounts.usd).toFixed(2)}$ = ${(this.totals.bs - this.discounts.bs).toFixed(2)}Bs`;

            this.copyToClipboard(text);
        },

        copyToClipboard(text) {
            if (window.clipboardData && window.clipboardData.setData) {
                // IE specific code path to prevent textarea being shown while dialog is visible.
                return clipboardData.setData("Text", text);

            } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
                var textarea = document.createElement("textarea");
                textarea.textContent = text;
                textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
                document.body.appendChild(textarea);
                textarea.select();

                try {
                    return document.execCommand("copy");
                } catch (ex) {
                    console.warn("Copy to clipboard failed.", ex);
                    return false;
                } finally {
                    document.body.removeChild(textarea);
                }
            }
        },
    },
    computed: {
        validDollar(){
            if (!this.dollar || isNaN(this.dollar)) return false;
            return true;
        },
        discounts(){
            let usd = 0;
            let bs = 0;

            if(this.staticCupon){
                let rate = parseFloat(this.client.static_discount)
                usd = this.totals.usd * rate;
                bs = this.totals.bs * rate;
            }else if(this.usingCupon){
                let rate = parseFloat(this.client.cupon_number)
                usd = this.totals.usd * rate;
                bs = this.totals.bs * rate;
            }
            
            
            return {usd,bs}; 
        },

        totals(){
            let usd = 0;
            let bs = 0;

            this.body.forEach(i => {
                if(i.item.jared){
                    usd += parseFloat(i.usd) + this.jarPrice;
                    bs += (parseFloat(i.usd) + this.jarPrice) * this.dollar;
                }else{
                    usd += parseFloat(i.usd);
                    bs += parseFloat(i.bs);
                }
            });

            return {usd,bs};
        },

        staticCupon(){
            if(this.client){
                if(this.client.static_discount && 
                    Date.now() < Date.parse(this.client.valid_to)
                    ){
                        return true;
                }
            }

            return false;
        },

        fillingTotals(){
            let usd = (parseFloat(this.fillingUsd) - this.totals.usd).toFixed(2);
            let bs = (parseFloat(this.fillingBs) - this.totals.bs).toFixed(2);
            usd = isNaN(usd) ? 0 : usd;
            bs = isNaN(bs) ? 0 : bs;
            return {usd,bs};
        },
    },
}
)


