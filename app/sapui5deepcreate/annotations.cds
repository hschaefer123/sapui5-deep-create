using udina.MockService as service from '../../srv/mock-service';

////////////////////////////////////////////////////////////////////////////
//
//	SalesOrder Common
//
annotate service.SalesOrder with {
    SalesOrder                @Common.IsDigitSequence : true;
    PurchaseOrderByCustomer   @title                  : 'Customer Order';
    CustomerPurchaseOrderDate @title                  : 'Requested Date';
};

////////////////////////////////////////////////////////////////////////////
//
//	SalesOrder ListReport
//
annotate service.SalesOrder with @(
    Common.SemanticKey : [SalesOrder],
    UI                 : {
        // Collection of fields identifying the object
        Identification      : [{Value : SalesOrder}],
        // Properties that might be relevant for filtering a collection of entities of this type
        SelectionFields     : [
            SalesOrder,
            PurchaseOrderByCustomer
        ],
        // Defines how the result of a queried collection of entities is shaped and how this result is displayed
        PresentationVariant : {
            // Sequence of groupable properties
            // GroupBy        : [createdAt],
            // List of sort criteria
            SortOrder      : [{
                //$Type      : 'Common.SortOrderType',
                Property   : SalesOrder,
                Descending : true
            }],
            // Lists available visualization types. Currently supported types are:
            // UI.LineItem, UI.Chart, and UI.DataPoint
            Visualizations : ['@UI.LineItem']
        },
        // Collection of data fields for representation in a table or list
        LineItem            : {$value : [
            {Value : SalesOrder},
            {Value : PurchaseOrderByCustomer}
        ]}
    }
);

////////////////////////////////////////////////////////////////////////////
//
//	SalesOrderItem Common
//
annotate service.SalesOrderItem with {
    RequestedQuantity     @title : 'Quantity';
    RequestedQuantityUnit @title : 'Unit';
    Material              @title : 'Material';
};
