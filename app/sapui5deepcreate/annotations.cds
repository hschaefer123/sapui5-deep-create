using udina.MockService as service from '../../srv/mock-service';

////////////////////////////////////////////////////////////////////////////
//
//	SalesOrder Common
//
annotate service.SalesOrder with {
    SalesOrder                 @title : '{i18n>SalesOrder}'                 @Common.IsDigitSequence : true;
    SalesOrderType             @title : '{i18n>SalesOrderType}';
    PurchaseOrderByCustomer    @title : '{i18n>PurchaseOrderByCustomer}';
    CustomerPurchaseOrderDate  @title : '{i18n>CustomerPurchaseOrderDate}'  @Common.FieldControl    : #Mandatory;
    SoldToParty                @title : '{i18n>SoldToParty}';
    PurchaseOrderByShipToParty @title : '{i18n>PurchaseOrderByShipToParty}';
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
            {Value : PurchaseOrderByCustomer},
            {
                $Type             : 'UI.DataFieldForAnnotation',
                Label             : '{i18n>PurchaseOrderByShipToParty}',
                Target            : 'to_SoldToParty/OrganizationName1/@Communication.Company',
                ![@UI.Importance] : #Low
            }
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
    RequestedQuantity      @title : '{i18n>RequestedQuantity}'      @Common.FieldControl : #Mandatory;
    RequestedQuantityUnit  @title : '{i18n>RequestedQuantityUnit}'  @Common.FieldControl : #Mandatory;
    Material               @title : '{i18n>Material}'               @Common.FieldControl : #Mandatory;
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
    PurchaseOrderByShipToParty @Common : {
        Text            : to_ShipToParty.OrganizationName1,
        TextArrangement : #TextFirst,
        ValueList       : {
            CollectionPath : 'ShipToPartnerVH',
            Parameters     : [
                {
                    $Type             : 'Common.ValueListParameterInOut',
                    LocalDataProperty : PurchaseOrderByShipToParty,
                    ValueListProperty : 'Customer'
                },
                {
                    $Type             : 'Common.ValueListParameterConstant',
                    ValueListProperty : 'PartnerFunction',
                    Constant          : 'WE'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'OrganizationName1'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'StreetName'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'HouseNumber'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'PostalCode'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'CityName'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'Country'
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

////////////////////////////////////////////////////////////////////////////
//
//	Contact General
//
annotate service.SalesOrderPartnerAddress with @(
                                                 //Common.SemanticKey : [email],
                                                 /*
                                                 UI                 : {
                                                     Identification               : [{Value : email}],
                                                     PresentationVariant #Contact : {SortOrder : [{
                                                         Property   : company,
                                                         Descending : true
                                                     }]}
                                                 },
                                                 */
                                               Communication : {Company : {
    fn    : AddresseeFullName,
    title : OrganizationName1,
    org   : OrganizationName1,
//role  : '{i18n>Role}',
// issue with photo! data taken from wrong entity!!!
//photo : imageUrl,
//photo : 'sap-icon://user',
/*
n     : {
    given      : firstName,
    additional : '',
    surname    : lastName
},
email : [{
    type    : #work,
    address : email
}],
tel   : [{
    type : #work,
    uri  : phone
}]
*/
}});
