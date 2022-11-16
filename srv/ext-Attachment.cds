namespace udina;

using {udina as my} from './ext-Attachment';
using {udina.MockService as MockService} from './mock-service';

extend projection MockService.SalesOrder with {
    // to_Attachment : Association to many MockService.Attachment
    // Error: It is not allowed to modify sub documents in to-many Association "to_Attachment"
    to_Attachment : Composition of many MockService.Attachment
                        on to_Attachment.SalesOrder = SalesOrder
}

extend projection MockService.SalesOrder with {
    to_SalesOrderType : Association to SalesOrderType
                            on to_SalesOrderType.SalesOrderType = SalesOrderType
}

@cds.persistence.table
entity Attachment {
    key SalesOrder   : String(10); //> foreign key
    key Item         : String(6);
        FileName     : String(255);
        MediaType    : String(20);
        Url          : String(255);
        ThumbnailUrl : String(255);
        Data         : String(50000); // Binary Data as Base64 for Upload
}

@cds.persistence.table
entity SalesOrderType {
    key SalesOrderType     : String(4);
        SalesOrderTypeName : String(20);
}

extend service MockService with {
    entity Attachment     as select from my.Attachment;
    entity SalesOrderType as select from my.SalesOrderType;
}
