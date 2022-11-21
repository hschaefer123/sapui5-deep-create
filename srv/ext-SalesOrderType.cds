namespace udina;

using {udina as my} from './ext-Attachment';
using {udina.MockService as MockService} from './mock-service';

extend projection MockService.SalesOrder with {
    to_SalesOrderType : Association to SalesOrderType
                            on to_SalesOrderType.SalesOrderType = SalesOrderType
}

@cds.persistence.table
entity SalesOrderType {
    key SalesOrderType     : String(4);
        SalesOrderTypeName : String(20);
}

extend service MockService with {
    entity SalesOrderType as select from my.SalesOrderType;
}
