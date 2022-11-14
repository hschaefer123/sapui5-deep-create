namespace udina;

using {API_SALES_ORDER_SRV} from './external/API_SALES_ORDER_SRV';

service MockService @(path : '/mock') {
    @cds.persistence.table
    entity SalesOrder     as select from API_SALES_ORDER_SRV.A_SalesOrder;

    @cds.persistence.table
    entity SalesOrderItem as select from API_SALES_ORDER_SRV.A_SalesOrderItem;
}
