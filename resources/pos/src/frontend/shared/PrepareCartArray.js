export const prepareCartArray = products => {

    let cartProductRowArray = [];
    products.forEach(product => {
        const taxAmount = (unitPrice) => {
            const total = Number(unitPrice);
            let tax = 0;

            if (product.attributes.order_tax > 0) {
                if (product.attributes.tax_type === 1 || product.attributes.tax_type === '1') {
                    tax = (total * Number(product.attributes.order_tax)) / 100;
                } else if (product.attributes.tax_type === 2 || product.attributes.tax_type === '2') {
                    tax = total - (total / (1 + Number(product.attributes.order_tax) / 100));
                }
            }

            return parseFloat(tax.toFixed(2));
        };
        
        cartProductRowArray.push({
            name: product.attributes.name,
            code: product.attributes.code,
            stock_alert: product.attributes.stock_alert,
            product_id: product.id,
            product_cost: product.attributes.product_cost,
            net_unit_cost: product.attributes.product_price,
            tax_type: product.attributes.tax_type.value ? Number(product.attributes.tax_type.value) : product.attributes.tax_type,
            product_price: product.attributes.product_price,
            product_wholesale_price: product.attributes.product_wholesale_price,
            product_special_price: product.attributes.product_special_price,
            tax_amount: taxAmount(product.attributes.product_price),
            discount_type: 1,
            discount_value: 0,
            discount_amount: 0,
            product_unit: product.attributes.product_unit,
            sale_unit: product.attributes.sale_unit,
            sale_unit_name: product.attributes.sale_unit_name?.short_name,
            quantity: product.attributes.stock.quantity > 1 ? 1 : product.attributes.stock.quantity,
            sub_total: 0,
            id: product.id,
            sale_id: 1,
            tax_value: product.attributes.order_tax ?? 0,
            hold_item_id: '',
            quantity_limit: product.attributes.quantity_limit,
            warehouse_id: 0
        })
    });
    return cartProductRowArray;
};
