import ReactDataTable from "../../shared/table/ReactDataTable";
import { getFormattedDate, getFormattedMessage } from "../../shared/sharedMethod";

export default function FiscalYearTable({ fiscalYears, allConfigData, handleActivate, isLoading, AddButton, onChange,  totalRecord }) {

  const itemsValue = Array.isArray(fiscalYears) ? fiscalYears.map((item) => ({
    id: item.id,
    name: item.attributes.name,
    start_date: item.attributes.start_date,
    end_date: item.attributes.end_date,
    is_completed: item.attributes.is_completed,
    is_active: item.attributes.is_active,
  })) : [];

  const columns = [
    {
      name: getFormattedMessage("fiscal-year.name.title"),
      selector: (row) => row?.name,
      sortable: false,
    },
    {
      name: getFormattedMessage("fiscal-year.start.date.title"),
      selector: (row) => row?.start_date,
      sortable: false,
      cell: (row) => getFormattedDate(row.start_date, allConfigData),
    },
    {
      name: getFormattedMessage("fiscal-year.end.date.title"),
      selector: (row) => row?.end_date,
      sortable: false,
      cell: (row) => getFormattedDate(row.end_date, allConfigData),
    },
    {
      name: getFormattedMessage("fiscal-year.complated.title"),
      selector: (row) => row?.is_completed,
      sortable: false,
      cell: (row) => {
        return row.is_completed == true ? (
          <span className="badge bg-light-success">
            {getFormattedMessage("status.filter.complated.label")}
          </span>
        ) : (
          <span className="badge bg-light-info">
            {getFormattedMessage("fiscal-year.ongoing.title")}
          </span>
        );
      },
    },
  ];

  return (
    <ReactDataTable
      totalRows={totalRecord}
      columns={columns}
      items={itemsValue}
      onChange={onChange}
      isLoading={isLoading}
      pagination={true}
      AddButton={AddButton}
    />
  );
}
