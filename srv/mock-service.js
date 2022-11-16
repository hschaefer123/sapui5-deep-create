const cds = require('@sap/cds')

module.exports = async function () {
    const db = await cds.connect.to('db') // connect to database service    
    const { SalesOrder, SalesOrderItem } = this.entities // get reflected definitions

    this.on('POST', 'SalesOrder', async (req, next) => {
        // this is a simulation of ABAP SEGW DeepCreate handling only!!!
        // this is not the way of doing this with CAP ;-)

        // manual handle autoInc SalesOrder number
        const { count } = await SELECT.one`count(SalesOrder) as count`.from(SalesOrder);
        // calc next id
        const nextSO = "0000000000" + (count + 1);
        const id = nextSO.substring(nextSO.length - 10);

        let salesOrder = req.data;

        // add next id
        salesOrder.SalesOrder = id;

        // item handling
        let salesOrderItems = salesOrder.to_Item;
        let salesOrderAttachments = salesOrder.to_Attachment;
        // remove items prior create, because CAP does not allow deep manipulation

        // External Models uses to_Item Association, but CAP needs Composition to allow DeepCreate
        // Error -> It is not allowed to modify sub documents in to-many Association
        // This would work for to_Attachment, because it uses Composition (Contained-In relationship)
        // ToDo: Maybe CSN relationship can also be overwritten by extension

        delete salesOrder.to_Item;
        delete salesOrder.to_Attachment;

        // manually create sales order
        const so = await cds.create(SalesOrder, salesOrder);

        // now read the items to salesorder to be able to return deep object (auto refresh)
        salesOrder.to_Item = salesOrderItems;

        let i = 1;
        // add missing keys for all items
        if (salesOrderItems && salesOrderItems.length > 0) {
            for (let item of salesOrderItems) {
                let pos = "000000" + i * 10;
                item.SalesOrder = id;
                item.SalesOrderItem = pos.substring(pos.length - 6);
                i++;
            }
        }
        //console.log(salesOrder);

        // manually create sales order items
        const soi = await cds.create(SalesOrderItem, salesOrderItems);

        // TODO: attachment handling        
        i = 1;
        if (salesOrderAttachments && salesOrderAttachments.length > 0) {
            for (let item of salesOrderAttachments) {
                let pos = "000000" + i * 10;
                item.SalesOrder = id;
                item.Item = pos.substring(pos.length - 6);
                i++;
            }
        }
        console.log("Attachments", salesOrderAttachments);        

        // return custom deep structure to allow UI5 binding updates with filled keys
        req.reply(salesOrder);
    })
}