namespace udina;

using {udina as my} from './ext-Attachment';
using {udina.MockService as MockService} from './mock-service';

extend projection MockService.SalesOrder with {
    to_SoldToParty : Association to MockService.SalesOrderPartnerAddress
                         on  to_SoldToParty.SalesOrder      = SalesOrder
                         and to_SoldToParty.PartnerFunction = 'AG'
}

extend projection MockService.SalesOrder with {
    to_ShipToParty : Association to MockService.SalesOrderPartnerAddress
                         on  to_ShipToParty.SalesOrder      = SalesOrder
                         and to_ShipToParty.PartnerFunction = 'WE'
}

extend projection MockService.SalesOrderHeaderPartner with {
    to_ShipToParty : Association to MockService.SalesOrderPartnerAddress
                         on  to_ShipToParty.SalesOrder                = SalesOrder
                         and to_ShipToParty.PartnerFunction           = 'WE'
                         and to_ShipToParty.AddressRepresentationCode = '1'
}

extend service MockService with {
    entity ShipToPartnerVH as select from MockService.SalesOrderHeaderPartner{
        Customer,
        PartnerFunction,
        to_ShipToParty.OrganizationName1,
        to_ShipToParty.AddresseeFullName,
        to_ShipToParty.StreetName,
        to_ShipToParty.HouseNumber,
        to_ShipToParty.PostalCode,
        to_ShipToParty.CityName,
        to_ShipToParty.Country
    };
}