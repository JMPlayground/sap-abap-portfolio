*&---------------------------------------------------------------------*
*&  Include           YFDMM_EX2_07_TOP
*&---------------------------------------------------------------------*

TABLES: ekpo, ekko.

INCLUDE <icon>.

DATA: ok_code TYPE sy-ucomm,
      save_ok TYPE sy-ucomm.

**********************************************************************
* ALV Container
**********************************************************************

DATA: go_container_alv1 TYPE REF TO cl_gui_custom_container,
      go_container_alv2 TYPE REF TO cl_gui_custom_container.

DATA: go_split_alv2 TYPE REF TO cl_gui_splitter_container.

DATA: go_container_vendor   TYPE REF TO cl_gui_container,
      go_container_material TYPE REF TO cl_gui_container.

**********************************************************************
* ALV Grid
**********************************************************************

DATA: go_alv_po       TYPE REF TO cl_gui_alv_grid,
      go_alv_vendor   TYPE REF TO cl_gui_alv_grid,
      go_alv_material TYPE REF TO cl_gui_alv_grid.

*---------------------------------------------------------------------*
* ALV1 - PO 출력 구조
*---------------------------------------------------------------------*
TYPES: BEGIN OF ty_alv_po,
         status      TYPE icon_d,              "상태 신호등
         ebeln       TYPE ekko-ebeln,          "PO Number
         ebelp       TYPE ekpo-ebelp,          "PO Item
         banfn       TYPE eban-banfn,          "Purchase Requisition
         bnfpo       TYPE eban-bnfpo,          "PR Item
         lifnr       TYPE lfa1-lifnr,          "Vendor
         name1       TYPE lfa1-name1,          "Vendor Name
         matnr       TYPE mara-matnr,          "Material
         maktx       TYPE makt-maktx,          "Material Description
         werks       TYPE ekpo-werks,          "Plant
         lgort       TYPE ekpo-lgort,          "S/L
         po_qty      TYPE ekpo-menge,          "PO Qty
         open_qty    TYPE ekpo-menge,          "Open PO Qty
         gr_proc_qty TYPE decfloat16,          "입력필드
         meins       TYPE ekpo-meins,          "Unit
         netpr       TYPE ekpo-netpr,          "Net Price
         waers       TYPE ekko-waers,          "Currency
         po_amt      TYPE ekpo-netwr,          "PO Amount
         gr_doc      TYPE char20,              "GR Doc
         gr_belnr    TYPE ekbe-belnr,          "GR Doc raw
         gr_gjahr    TYPE ekbe-gjahr,          "GR Year
         gr_qty      TYPE ekbe-menge,          "GR Qty
         gr_amt      TYPE ekbe-dmbtr,          "GR Amount
         iv_doc      TYPE char20,              "IV Doc
         iv_belnr    TYPE ekbe-belnr,                "IV Doc raw
         iv_gjahr    TYPE ekbe-gjahr,          "IV Year
         iv_amt      TYPE ekbe-dmbtr,          "IV Amount
       END OF ty_alv_po.

DATA: gt_alv_po TYPE STANDARD TABLE OF ty_alv_po,
      gs_alv_po TYPE ty_alv_po.

DATA: gt_fcat_po TYPE lvc_t_fcat,
      gs_fcat_po TYPE lvc_s_fcat,
      gs_layo_po TYPE lvc_s_layo.

*---------------------------------------------------------------------*
* ALV2 - Vendor 출력 구조
*---------------------------------------------------------------------*
TYPES: BEGIN OF ty_alv_vendor,
         lifnr    TYPE lfa1-lifnr,
         name1    TYPE lfa1-name1,
         po_qty   TYPE ekpo-menge,
         open_qty TYPE ekpo-menge,
         po_amt   TYPE ekpo-netwr,
         gr_qty   TYPE ekbe-menge,
         gr_amt   TYPE ekbe-dmbtr,
         iv_amt   TYPE ekbe-dmbtr,
       END OF ty_alv_vendor.

DATA: gt_alv_vendor TYPE STANDARD TABLE OF ty_alv_vendor,
      gs_alv_vendor TYPE ty_alv_vendor.

DATA: gt_fcat_vendor TYPE lvc_t_fcat,
      gs_fcat_vendor TYPE lvc_s_fcat,
      gs_layo_vendor TYPE lvc_s_layo.

*---------------------------------------------------------------------*
* ALV2 - Material 출력 구조
*---------------------------------------------------------------------*
TYPES: BEGIN OF ty_alv_material,
         matnr    TYPE mara-matnr,
         maktx    TYPE makt-maktx,
         po_qty   TYPE ekpo-menge,
         open_qty TYPE ekpo-menge,
         po_amt   TYPE ekpo-netwr,
         gr_qty   TYPE ekbe-menge,
         gr_amt   TYPE ekbe-dmbtr,
         iv_amt   TYPE ekbe-dmbtr,
       END OF ty_alv_material.

DATA: gt_alv_material TYPE STANDARD TABLE OF ty_alv_material,
      gs_alv_material TYPE ty_alv_material.

DATA: gt_fcat_material TYPE lvc_t_fcat,
      gs_fcat_material TYPE lvc_s_fcat,
      gs_layo_material TYPE lvc_s_layo.

*---------------------------------------------------------------------*
* PO Base Data
*---------------------------------------------------------------------*
TYPES: BEGIN OF ty_po_raw,
         ebeln  TYPE ekko-ebeln,
         ebelp  TYPE ekpo-ebelp,
         banfn  TYPE ekpo-banfn,
         bnfpo  TYPE ekpo-bnfpo,
         lifnr  TYPE ekko-lifnr,
         name1  TYPE lfa1-name1,
         matnr  TYPE ekpo-matnr,
         maktx  TYPE makt-maktx,
         werks  TYPE ekpo-werks,
         lgort  TYPE ekpo-lgort,
         loekz  TYPE ekpo-loekz,
         po_qty TYPE ekpo-menge,
         meins  TYPE ekpo-meins,
         netpr  TYPE ekpo-netpr,
         waers  TYPE ekko-waers,
         po_amt TYPE ekpo-netwr,
       END OF ty_po_raw.

DATA: gt_po_raw TYPE STANDARD TABLE OF ty_po_raw,
      gs_po_raw TYPE ty_po_raw.

*---------------------------------------------------------------------*
* EKBE History
*---------------------------------------------------------------------*
TYPES: BEGIN OF ty_po_hist,
         ebeln TYPE ekbe-ebeln,
         ebelp TYPE ekbe-ebelp,
         vgabe TYPE ekbe-vgabe,
         bwart TYPE ekbe-bwart,
         shkzg TYPE ekbe-shkzg,
         menge TYPE ekbe-menge,
         dmbtr TYPE ekbe-dmbtr,
         belnr TYPE ekbe-belnr,
         gjahr TYPE ekbe-gjahr,
         budat TYPE ekbe-budat,
       END OF ty_po_hist.

DATA: gt_po_hist TYPE STANDARD TABLE OF ty_po_hist,
      gs_po_hist TYPE ty_po_hist.

*---------------------------------------------------------------------*
* Latest GR / IV Doc
*---------------------------------------------------------------------*
TYPES: BEGIN OF ty_po_doc,
         ebeln    TYPE ekbe-ebeln,
         ebelp    TYPE ekbe-ebelp,
         gr_qty   TYPE ekbe-menge,
         gr_amt   TYPE ekbe-dmbtr,
         iv_amt   TYPE ekbe-dmbtr,
         gr_belnr TYPE ekbe-belnr,
         gr_gjahr TYPE ekbe-gjahr,
         gr_cnt   TYPE i,
         iv_belnr TYPE ekbe-belnr,
         iv_gjahr TYPE ekbe-gjahr,
         iv_cnt   TYPE i,
       END OF ty_po_doc.

DATA: gt_po_doc TYPE STANDARD TABLE OF ty_po_doc,
      gs_po_doc TYPE ty_po_doc.

*---------------------------------------------------------------------*
* Doc Flow Popup Data
*---------------------------------------------------------------------*
CONTROLS: tc_docflow TYPE TABSTRIP.

DATA:       gv_gr_mode     TYPE c LENGTH 1,
            gv_ir_mode     TYPE c LENGTH 1,    " S: Single / M: Multi
            gv_pressed_tab TYPE sy-ucomm VALUE 'TAB1',
            gv_subscreen   TYPE sy-dynnr.

DATA: go_container_gr TYPE REF TO cl_gui_custom_container,
      go_container_ir TYPE REF TO cl_gui_custom_container,
      go_alv_gr       TYPE REF TO cl_gui_alv_grid,
      go_alv_ir       TYPE REF TO cl_gui_alv_grid.

TYPES: BEGIN OF ty_doc_gr,
         pur_no  TYPE ekko-ebeln,
         item_no TYPE ekpo-ebelp,
         gr_doc  TYPE ekbe-belnr,
         gr_year TYPE ekbe-gjahr,
         gr_qty  TYPE ekbe-menge,
         gr_amt  TYPE ekbe-dmbtr,
       END OF ty_doc_gr.

TYPES: BEGIN OF ty_doc_ir,
         pur_no  TYPE ekko-ebeln,
         item_no TYPE ekpo-ebelp,
         iv_doc  TYPE ekbe-belnr,
         iv_year TYPE ekbe-gjahr,
         iv_amt  TYPE ekbe-dmbtr,
       END OF ty_doc_ir.

DATA: gt_doc_gr TYPE STANDARD TABLE OF ty_doc_gr,
      gs_doc_gr TYPE ty_doc_gr,
      gt_doc_ir TYPE STANDARD TABLE OF ty_doc_ir,
      gs_doc_ir TYPE ty_doc_ir.

DATA: gt_fcat_gr TYPE lvc_t_fcat,
      gs_fcat_gr TYPE lvc_s_fcat,
      gs_layo_gr TYPE lvc_s_layo,
      gt_fcat_ir TYPE lvc_t_fcat,
      gs_fcat_ir TYPE lvc_s_fcat,
      gs_layo_ir TYPE lvc_s_layo.
*---------------------------------------------------------------------*
* Popup Detail Fields
*---------------------------------------------------------------------*
DATA: gv_po_no   TYPE ekko-ebeln,
      gv_item_no TYPE ekpo-ebelp,
      gv_gr_doc  TYPE ekbe-belnr,
      gv_gr_year TYPE ekbe-gjahr,
      gv_gr_qty  TYPE ekbe-menge,
      gv_gr_amt  TYPE ekbe-dmbtr,
      gv_iv_doc  TYPE ekbe-belnr,
      gv_iv_year TYPE ekbe-gjahr,
      gv_iv_amt  TYPE ekbe-dmbtr.