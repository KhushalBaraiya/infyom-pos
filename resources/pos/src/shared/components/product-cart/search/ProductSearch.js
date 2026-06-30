import React, {useState} from 'react';
import {connect, useDispatch} from 'react-redux';
import {ReactSearchAutocomplete} from 'react-search-autocomplete';
import {addToast} from '../../../../store/action/toastAction';
import {toastType} from '../../../../constants';
import {searchPurchaseProduct} from '../../../../store/action/purchaseProductAction';
import {getFormattedMessage, placeholderText} from '../../../sharedMethod';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import {faBarcode} from "@fortawesome/free-solid-svg-icons";

const ProductSearch = (props) => {
    const {
        values,
        products,
        updateProducts,
        setUpdateProducts,
        customProducts,
        searchPurchaseProduct,
        handleValidation,
        isAllProducts,
        isLoading
    } = props;
    const [searchString, setSearchString] = useState("");
    const [scannerMode, setScannerMode] = useState(false);
    const dispatch = useDispatch();
    const filterProducts = isAllProducts && values.warehouse_id ? products.map((item) => ({
        name: item.attributes.name, code: item.attributes.code, id: item.id
    })) : values.warehouse_id && products.filter((qty) => qty && qty.attributes && qty.attributes.stock && qty.attributes.stock.quantity > 0).map((item) => ({
        name: item.attributes.name, code: item.attributes.code, id: item.id
    }))

    const onProductSearch = (code) => {
        if (!values.warehouse_id) {
            handleValidation();
        } else {
            setSearchString(code);
            const matchedProduct = products.find((item) => item.attributes.code === code || item.attributes.code === code.code);
            const newId = matchedProduct ? [matchedProduct.id] : [];

            if (!isAllProducts && matchedProduct && (!matchedProduct.attributes.stock || matchedProduct.attributes.stock.quantity <= 0)) {
                dispatch(addToast({ text: getFormattedMessage("pos.this.product.out.of.stock.message"), type: toastType.ERROR }));
                setSearchString("");
                return;
            }

            const finalIdArrays = customProducts.map((id) => id.product_id);
            const finalId = finalIdArrays.filter((finalIdArray) => finalIdArray === newId[0]);
            if (finalId[0] !== undefined) {
                if (updateProducts.find(exitId => exitId.product_id === finalId[0])) {
                    setSearchString("");
                    let Increased = updateProducts.map((product) => {
                        if (product.product_id === finalId[0]) {
                            return {...product, quantity: product.quantity + 1}
                        }
                        return product
                    })
                    setUpdateProducts([...Increased]);
                } else {
                    searchPurchaseProduct(newId[0])
                    const pushArray = [...customProducts]
                    const newProduct = pushArray.find(element => element.product_id === finalId[0]);
                    setUpdateProducts([...updateProducts, newProduct]);
                    setSearchString("");
                }
                removeSearchClass();
            } else if (scannerMode) {
                setSearchString("");
                dispatch(addToast({ text: getFormattedMessage("no-product-found.label"), type: toastType.ERROR }));
            }
        }
    }

    const handleOnSearch = (string) => {
        if (scannerMode) {
            onProductSearch(string);
        }
    };

    const handleOnSelect = (result) => {
        onProductSearch(result);
    }

    const formatResult = (item) => {
        return (
            <span onClick={(e) => e.stopPropagation()}>{item.code} ({item.name})</span>
        )
    }

    const removeSearchClass = () => {
        const html = document.getElementsByClassName(`custom-search`)[0].firstChild.firstChild.lastChild;
        html.style.display = 'none'
    }

    const inputFocus = () => {
        let searchInput = document.querySelector(
            'input[data-test="search-input"]'
        );
        searchInput.focus();
    };

    return (
        <div className='d-flex align-items-center gap-2'>
            <div className='position-relative custom-search flex-grow-1' style={isLoading ? {pointerEvents: 'none'} : {}}>
                <ReactSearchAutocomplete
                    items={filterProducts}
                    onSearch={handleOnSearch}
                    inputSearchString={searchString}
                    fuseOptions={{keys: ['code', 'name']}}
                    resultStringKeyName='code'
                    placeholder={isLoading ? placeholderText("globally.loading.label") : placeholderText('globally.search.field.label')}
                    onSelect={handleOnSelect}
                    formatResult={formatResult}
                    showIcon={false}
                    showClear={false}
                    disabled={isLoading}
                />
                <FontAwesomeIcon icon={faSearch}
                                 className='d-flex align-items-center top-0 bottom-0 react-search-icon my-auto text-gray-600 position-absolute'/>
            </div>
            {values.warehouse_id && <button
                type='button'
                className={`btn btn-md h-100 ${scannerMode ? 'btn-primary' : 'btn-light border'}`}
                onClick={() =>{ setScannerMode(prev => !prev); inputFocus(); }}
                title={scannerMode ? 'Scanner mode: ON' : 'Scanner mode: OFF'}
            >
                <FontAwesomeIcon icon={faBarcode} />
            </button>}
        </div>
    );
}

export default connect(null, {searchPurchaseProduct})(ProductSearch);
