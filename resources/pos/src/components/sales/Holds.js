import { connect } from "react-redux";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import { getFormattedDate, getFormattedMessage, placeholderText } from "../../shared/sharedMethod";
import HeaderTitle from "../header/HeaderTitle";
import MasterLayout from "../MasterLayout";
import { fetchHoldList, fetchHoldLists, deleteHoldItem } from "../../store/action/pos/HoldListAction";
import { useEffect, useState } from "react";
import ReactDataTable from "../../shared/table/ReactDataTable";
import TabTitle from "../../shared/tab-title/TabTitle";
import DeleteHold from "./DeleteHold";
import ActionButton from "../../shared/action-buttons/ActionButton";
import { useNavigate } from "react-router";

const Holds = (props) => {
  const {holdListData, totalRecord, isLoading, fetchHoldLists, allConfigData} = props;
  const [deleteModel, setDeleteModel] = useState(false);
  const [isDelete, setIsDelete] = useState(null);
  const navigate = useNavigate();
  useEffect(()=>{
   fetchHoldLists();
  },[])

  const onClickDeleteModel = (isDelete = null) => {
    setDeleteModel(!deleteModel);
    setIsDelete(isDelete?.id);
  };

  const goToEditHold = (item) => {
    navigate(`/app/holds/edit/${item.id}`);
  };

  const onChange = (filter) => {
    fetchHoldLists(filter, true)
  };

  const itemsValue = 
      holdListData && holdListData.length > 0 && holdListData.map((item) => ({
        id: item.id,
        date: getFormattedDate(item.attributes.created_at, allConfigData && allConfigData),
        referenceId: item.attributes.reference_code,
  }));

  const column = [
    {
      name: getFormattedMessage("hold.list.id.title"),
      selector: (row) => row.id,

    },
    {
      name : (
        <div style={{ width: "100%", textAlign: "center" }}>
          {getFormattedMessage("hold.list.date.label")}
        </div>
      ),
      selector: (row) => row.date,
      sortable: true,
      sortField: "created_at",
      center:true
    },
    {
      name: (
        <div style={{ width: "100%", textAlign: "center" }}>
          {getFormattedMessage("reference.id.title")}
        </div>
      ),
      selector: (row) => row.referenceId,
      center: true,
    },
    {
      name: (
        <div style={{ width: "100%", textAlign: "right" }}>
          {getFormattedMessage("react-data-table.action.column.label")}
        </div>
      ),
      right: true,
      ignoreRowClick: true,
      allowOverflow: true,
      cell: (row) =>
        <ActionButton
          item={row}
          goToEditProduct={goToEditHold}
          onClickDeleteModel={onClickDeleteModel}
          isDeleteMode={true}
          isEditMode={true}
        />
    }

  ]


  return (
    <MasterLayout>
       <TopProgressBar />
       <TabTitle title={placeholderText("pos.hold-list-btn.title")} />
        <HeaderTitle title={getFormattedMessage( 'holds.title' )} addLink="/app/holds/create" description={getFormattedMessage('holds.description')} />
        <ReactDataTable
        columns={column}
        items={itemsValue}
        totalRows={totalRecord}
        isLoading={isLoading}
        isShowDateRangeField
        onChange={onChange}
        />
        <DeleteHold onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel} onDelete={isDelete} />
    </MasterLayout>
  )
}

const mapStateToProps = (state) => {
    const {
        holdListData,
        totalRecord,
        isLoading,
        allConfigData,  
    } = state;
    return {
        holdListData,
        totalRecord,
        isLoading,
        allConfigData,
    };
};

export default connect(mapStateToProps, {
    fetchHoldLists,
    fetchHoldList,
})(Holds);