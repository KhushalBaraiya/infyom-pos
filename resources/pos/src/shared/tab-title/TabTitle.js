import React from 'react';
import {Helmet} from 'react-helmet';
import {useSelector} from "react-redux";

const TabTitle = (props) => {
    const { title } = props;
    const {frontSetting, allConfigData, frontCms} = useSelector(state => state)

    return (
        <Helmet>
            <title>{title + ' '} {frontSetting ? ` | ${allConfigData && allConfigData.store_name ? allConfigData.store_name : frontSetting?.value?.company_name ? frontSetting?.value?.company_name : frontCms?.value?.company_name}` : ""}</title>
            {(frontSetting?.value?.logo || frontCms?.value?.logo) && <link rel="icon" type="image/png" href={frontSetting?.value?.logo ? frontSetting?.value?.logo : frontCms?.value?.logo ? frontCms?.value?.logo : "./../../../public/favicon.ico"}  sizes="16x16" />}
        </Helmet>
    )
}

export default TabTitle;
