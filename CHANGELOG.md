# Change Log

- All notable changes to this project are documented in this file.
- The format is based on [Keep a Changelog](http://keepachangelog.com/).
- This project adheres to [Semantic Versioning](http://semver.org/).


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
