using udina.MockService as service from '../../srv/mock-service';

////////////////////////////////////////////////////////////////////////////
//
//	SalesOrder Common
//
annotate service.SalesOrder with {
    SalesOrder                @title : '{i18n>SalesOrder}'  @Common.IsDigitSequence : true;
    SalesOrderType            @title : '{i18n>SalesOrderType}';
    PurchaseOrderByCustomer   @title : '{i18n>PurchaseOrderByCustomer}';
    CustomerPurchaseOrderDate @title : '{i18n>CustomerPurchaseOrderDate}';
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
            SalesOrderType,
            CustomerPurchaseOrderDate
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
            {Value : SalesOrderType},
            {Value : PurchaseOrderByCustomer}
        ]}
    },
    Capabilities       : {
                          //SearchRestrictions : {Searchable : false},
                         FilterRestrictions : {FilterExpressionRestrictions : [{
        Property           : 'CustomerPurchaseOrderDate',
        AllowedExpressions : 'SingleRange'
    }]}}
);

////////////////////////////////////////////////////////////////////////////
//
//	SalesOrderItem Common
//
annotate service.SalesOrderItem with {
    RequestedQuantity     @title : '{i18n>RequestedQuantity}';
    RequestedQuantityUnit @title : '{i18n>RequestedQuantityUnit}';
    Material              @title : '{i18n>Material}';
};

////////////////////////////////////////////////////////////////////////////
//
//	SalesOrder - Value Helps
//
annotate service.SalesOrder with {
    SalesOrderType @Common : {
        Text            : to_SalesOrderType.SalesOrderTypeName,
        TextArrangement : #TextLast,
        ValueListWithFixedValues,
        ValueList       : {
            CollectionPath : 'SalesOrderType',
            Parameters     : [
                {
                    $Type             : 'Common.ValueListParameterInOut',
                    LocalDataProperty : SalesOrderType,
                    ValueListProperty : 'SalesOrderType'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'SalesOrderTypeName'
                }
            ]
        }
    };
}

annotate service.SalesOrderType with {
    SalesOrderType @Common : {
        Text            : SalesOrderTypeName,
        TextArrangement : #TextLast
    }
}
