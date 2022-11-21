# Change Log

- All notable changes to this project are documented in this file.
- The format is based on [Keep a Changelog](http://keepachangelog.com/).
- This project adheres to [Semantic Versioning](http://semver.org/).

## Version 0.1.3 - 2022-11-18

### Added
- PageController to decouple pageReady and future placeholder loading
- formatter added to OP controller
- fileNameIcon formatter used in to_Attachment list
- sap.fe.placeholder library for placeholder loading of LR and OP
- manifest placeholder loading added to list and object target
- controller extension AnnotationHelper for future use

### Changed
- using SAPUI5 1.108.1 till CDN default is 1.108
- moved LR formatter to model/formatter
- moved ui model instantiation to component for compliancy (see sap.fe.core.AppComponent)
- LR extends PageController
- OP extends PageController
- press avatar icon to preview attachment (annotated with zoom icon)
- removed vertically center from NotFound and ObjectNotFound
- use new object pattern: "object({objectId}):?query:" and use "..." for create

### Fixed
- ean128.png thumbnail url
- remove readonly stepinput dashline with custom css style

## Version 0.1.2 - 2022-11-18

### Added
- Image attachment now open using the FileViewers LightBox dialog

### Changed
- controller extension PDFViewer renamed to FileViewer because also supporting images and maybe more to come

### Fixed
- delete mode on items table removed in display mode

## Version 0.1.2 - 2022-11-17

### Changed
- ObjectPageLayout hides HeaderContent in edit mode
- SmartFilterBar uses useDateRangeType="true" for RequestedDeliveryDate
- ObjectPage to_Item table now uses native delete feature instead action button and focus table afterwards

## Version 0.1.1 - 2022-11-16

### Fixed
- returning to_Attachment after creation without data

### Added
- PDFViewer extension used with UploadSet pdf preview
- sap.ndc.BarcodeScanner to allow adding items by ean-code
- SalesOrderType to mock service and ValueHelp
- ListReport SalesOrderType as SelectionField with annotated ValueHelp
- attachment ean128.png showing barcode for material R2D2C3PO ean-128 encoded
- CustomerPurchaseOrderDate annotation for date range selection
- ObjectPage item title with count

### Changed
- centered IllustrationMessage for NotFound and ObjectNotFound view
- removed SalesOrder from ListReport SelectionFields annotation
- Added Attachment readonly List because UploadSet does not really support it

## Version 0.1.0 - 2022-11-01

- Initial Release
