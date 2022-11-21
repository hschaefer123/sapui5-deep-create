namespace udina;

using {udina as my} from './ext-Attachment';
using {udina.MockService as MockService} from './mock-service';

extend projection MockService.SalesOrder with {
    // to_Attachment : Association to many MockService.Attachment
    // Error: It is not allowed to modify sub documents in to-many Association "to_Attachment"
    to_Attachment : Composition of many MockService.Attachment
                        on to_Attachment.SalesOrder = SalesOrder
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

extend service MockService with {
    entity Attachment as select from my.Attachment;
}
