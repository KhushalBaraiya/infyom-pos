import React, { useEffect, useRef, useState } from "react";
import { Col } from "react-bootstrap-v5";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import { connect, useDispatch } from "react-redux";
import {
    posSearchCodeProduct,
    posSearchNameProduct,
} from "../../../store/action/pos/posfetchProductAction";
import {
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";
import { addToast } from "../../../store/action/toastAction";
import { toastType } from "../../../constants";
import productImage from "../../../assets/images/brand_logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBarcode } from "@fortawesome/free-solid-svg-icons";

const ProductSearchbar = (props) => {
    const {
        posAllProducts,
        customCart,
        setUpdateProducts,
        updateProducts,
        posSearchCodeProduct,
        posSearchNameProduct,
        selectedOption,
        onSearchProduct,
        settings,
    } = props;
    const [searchString, setSearchString] = useState("");
    const [scannerMode, setScannerMode] = useState(false);
    const [keyDown, setKeyDown] = useState(false);
    const dispatch = useDispatch();
    const clickAudioRef = useRef(null);
    const filterProduct = (settings?.attributes?.show_pos_stock_product === 'true'
        ? posAllProducts
        : posAllProducts.filter((item) => item.attributes.stock.quantity > 0)
        ).map((item) => ({
            name: item.attributes.name,
            code: item.attributes.code,
            id: item.id,
            stock: item.attributes.stock.quantity,
            unit: item?.attributes?.product_unit_name?.name,
            image: item.attributes?.images?.imageUrls?.[0]
        }));

    const formatResult = (item) => {
        return (
            <div className="d-flex align-items-center gap-4" >
                <img
                    src={item?.image ? item?.image : productImage}
                    alt={item.name}
                    className="search-image"
                />
                <span>
                    {item.code} ({item.name}) - {getFormattedMessage('purchase.order-item.table.stock.column.label')}: {item?.stock} {item?.unit}
                </span>
            </div>
        );
    };

    const removeSearchClass = () => {
        const searchBar = document.getElementsByClassName("search-bar")[0];
        if (
            searchBar &&
            searchBar.firstChild &&
            searchBar.firstChild.firstChild &&
            searchBar.firstChild.firstChild.lastChild
        ) {
            const html = searchBar.firstChild.firstChild.lastChild;
            html.style.display = "none";
        } else {
            console.warn("Could not hide search result — element not found");
        }
    };
    const [lastScannedCode, setLastScannedCode] = useState(null);

    const onProductSearch = (code) => {
        const codeSearch = posAllProducts
            .filter(
                (item) =>
                    item.attributes.code === code ||
                    item.attributes.code === code.code
            )
            .map((item) => item.attributes.code);
        const nameSearch = posAllProducts
            .filter(
                (item) =>
                    item.attributes.name === code ||
                    item.attributes.name === code.name
            )
            .map((item) => item.attributes.name);
        const finalArrays = customCart.map((customId) =>
            code === customId.code ? customId.code : customId.name
        );
        const finalSearch = finalArrays.filter((finalArray) =>
            finalArray === codeSearch[0] ? codeSearch[0] : nameSearch[0]
        );
        const singleProduct = posAllProducts
            .filter(
                (product) =>
                    product.attributes.code === code ||
                    product.attributes.name === code ||
                    product.attributes.code === code.code ||
                    product.attributes.name === code.name
            )
            .map((product) => product.attributes.stock.quantity);
        const filterQty = updateProducts
            .filter(
                (item) =>
                    item.code == code ||
                    item.name == code ||
                    item.code == code.code ||
                    item.name == code.name
            )
            .map((qty) => qty.quantity)[0];
        if (finalSearch[0]) {
            if (codeSearch[0] == code) {
                posSearchCodeProduct(codeSearch[0]);
            } else {
                posSearchNameProduct(nameSearch[0]);
            }
            removeSearchClass();
            setSearchString("");
            if (settings?.attributes?.enable_pos_click_audio === "true" &&
                clickAudioRef.current
            ) {clickAudioRef.current.play().catch((e) => {
                    console.warn("Audio play failed:", e);
                });
            }
            let pushArray = [...customCart];
            let newProduct = pushArray.find(
                (element) => element.code === codeSearch[0] || element.name === nameSearch[0]
            );
            if (
                updateProducts.filter(
                    (item) =>
                        item.code === code ||
                        item.name === code ||
                        item.code === code.code || 
                        item.name === code.name
                ).length > 0
            ) {
                if (filterQty >= singleProduct[0]) {
                    dispatch(
                        addToast({
                            text: getFormattedMessage(
                                "pos.quantity.exceeds.quantity.available.in.stock.message"
                            ),
                            type: toastType.ERROR,
                        })
                    );
                } else {
                    setUpdateProducts((updateProducts) =>
                        updateProducts.map((item) =>
                            (item.code == code ||
                                item.name == code ||
                                item.code == code.code || 
                                item.name === code.name
                            ) && 
                            singleProduct[0] > item.quantity
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        )
                    );
                    setKeyDown(false);
                }
            } else {
                setUpdateProducts([
                    ...updateProducts,
                    { ...newProduct, warehouse_id: selectedOption?.value },
                ]);
                setKeyDown(false);
                removeSearchClass(true);
            }
        }
    };

    let scanProductBarCode = false;
    const handleOnSelect = (result) => {
        if (keyDown === false && scanProductBarCode === true) {
            onProductSearch(result);
            scanProductBarCode = false;
        }

        if (searchString.trim()?.length !== 0) {
            onProductSearch(result);
        }
    };

    const handleOnSearch = (string) => {
        if (string.trim() !== "") {
            setSearchString(string);
            const filteredProducts = settings?.attributes?.show_pos_stock_product === 'true'
                ? posAllProducts
                : posAllProducts.filter(item => item.attributes.stock.quantity > 0);

            const codeSearch = filteredProducts.filter(
                item => item.attributes.code === string || item.attributes.name === string
            );
            if (codeSearch.length > 0) {
                if (codeSearch[0].attributes?.stock?.quantity > 0) {
                    if (scannerMode && codeSearch?.length === 1) {
                        scanProductBarCode = true;
                        const data = {
                            name: codeSearch[0]?.attributes?.name,
                            code: codeSearch[0]?.attributes?.code,
                            id: codeSearch[0]?.id,
                        };
                        handleOnSelect(data);
                        setSearchString("");
                    }
                } else {
                    dispatch(
                        addToast({
                            text: getFormattedMessage(
                                "pos.this.product.out.of.stock.message"
                            ),
                            type: toastType.ERROR,
                        })
                    );
                    setSearchString("");
                }
            } else {
                onSearchProduct(string);
                setLastScannedCode(string);
                if (scannerMode) {
                    setSearchString("");
                    removeSearchClass();
                    dispatch(
                        addToast({
                            text: getFormattedMessage("no-product-found.label"),
                            type: toastType.ERROR,
                        })
                    );
                }
            }
        }
    };

    useEffect(() => {
        if (lastScannedCode && posAllProducts.length) {
            onProductSearch(lastScannedCode);
            setLastScannedCode(null);
        }
    }, [posAllProducts]);

    const inputFocus = () => {
        let searchInput = document.querySelector(
            'input[data-test="search-input"]'
        );
        searchInput.focus();
    };

    useEffect(() => {
        const keyDownHandler = (event) => {
            if (event.altKey && event.code === "KeyQ") {
                event.preventDefault();
                inputFocus();
            }
        };

        document.addEventListener("keydown", keyDownHandler);

        return () => {
            document.removeEventListener("keydown", keyDownHandler);
        };
    }, []);

    return (
        <Col className="d-flex flex-grow-1 align-items-center gap-2 my-3 col-xxl-8 col-lg-12 col-12">
            <div className="position-relative search-bar flex-grow-1">
                <audio ref={clickAudioRef} src={settings?.attributes?.click_audio} preload="auto" />
                <ReactSearchAutocomplete
                    placeholder={placeholderText("pos-globally.search.field.label")}
                    items={filterProduct}
                    onSearch={handleOnSearch}
                    inputSearchString={searchString}
                    fuseOptions={{
                        shouldSort: true,
                        threshold: 0.2,
                        location: 0,
                        distance: 100,
                        minMatchCharLength: 2,
                        keys: ["name", "code"],
                    }}
                    resultStringKeyName="code"
                    onSelect={(data) => {
                        handleOnSelect(data);
                    }}
                    formatResult={formatResult}
                    showIcon={false}
                    showClear={false}
                    autoFocus={true}
                />
                <i className="bi bi-search fs-2 react-search-icon position-absolute top-0 bottom-0 d-flex align-items-center ms-2" />
            </div>
            <button
                type='button'
                className={`btn btn-md ${scannerMode ? 'btn-primary' : 'btn-light border'}`}
                onClick={() => { setScannerMode(prev => !prev); inputFocus(); }}
                title={scannerMode ? 'Scanner mode: ON' : 'Scanner mode: OFF'}
            >
                <FontAwesomeIcon icon={faBarcode} />
            </button>
        </Col>
    );
};

const mapStateToProps = (state) => {
    const { posAllProducts } = state;
    return { posAllProducts };
};

export default connect(mapStateToProps, {
    posSearchCodeProduct,
    posSearchNameProduct,
})(ProductSearchbar);
