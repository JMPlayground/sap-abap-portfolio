*&---------------------------------------------------------------------*
*&  Include           YFDMM_EX2_07_F01
*&---------------------------------------------------------------------*
*&---------------------------------------------------------------------*
*&      Form  INIT
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*  -->  p1        text
*  <--  p2        text
*----------------------------------------------------------------------*
FORM init .

ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  SCONTROL
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*  -->  p1        text
*  <--  p2        text
*----------------------------------------------------------------------*
FORM scontrol .

ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  VALIDATION
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*  -->  p1        text
*  <--  p2        text
*----------------------------------------------------------------------*
FORM validation .

ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  GET_DATA
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*  -->  p1        text
*  <--  p2        text
*----------------------------------------------------------------------*
FORM get_data .

  REFRESH: gt_alv_po, gt_alv_vendor, gt_alv_material,
           gt_po_raw, gt_po_hist, gt_po_doc.

  PERFORM get_po_base_data.
  PERFORM get_po_hist_data.
  PERFORM make_alv_po_data.
  PERFORM make_alv_summary_data.

ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  GET_PO_BASE_DATA
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*  -->  p1        text
*  <--  p2        text
*----------------------------------------------------------------------*
FORM get_po_base_data .

  SELECT
     a~ebeln a~lifnr a~waers
     b~ebelp b~banfn b~bnfpo b~matnr b~werks b~lgort b~loekz b~menge AS po_qty b~meins  b~netpr  b~netwr AS po_amt
     l~name1 k~maktx
     INTO CORRESPONDING FIELDS OF TABLE gt_po_raw
     FROM ekko AS a INNER JOIN ekpo AS b
       ON a~ebeln = b~ebeln
                    INNER JOIN lfa1 AS l
       ON a~lifnr = l~lifnr
                    LEFT JOIN makt AS k
       ON b~matnr = k~matnr AND k~spras = sy-langu
     WHERE a~bstyp = 'F' "EKKO에서 PO만 가져오기
       AND a~bukrs IN s_bukrs
       AND b~werks IN s_werks
       AND b~matnr IN s_matnr
       AND a~lifnr IN s_lifnr
       AND a~ebeln IN s_ebeln
       AND a~ekorg IN s_ekorg
       AND a~ekgrp IN s_ekgrp
       AND b~pstyp IN s_pstyp
       AND b~knttp IN s_knttp.

  IF p_del IS INITIAL.
    DELETE gt_po_raw WHERE loekz = 'L'.
  ENDIF.

  SORT gt_po_raw BY ebeln ebelp.

ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  GET_PO_HIST_DATA
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*  -->  p1        text
*  <--  p2        text
*----------------------------------------------------------------------*
FORM get_po_hist_data .

  DATA: lv_sign TYPE i.

  IF gt_po_raw IS INITIAL.
    EXIT.
  ENDIF.
*------------------------------------------------------------------*
* 1. EKBE History
*------------------------------------------------------------------*
  SELECT
    ebeln ebelp vgabe bwart shkzg menge dmbtr belnr gjahr budat
    INTO CORRESPONDING FIELDS OF TABLE gt_po_hist
    FROM ekbe
    FOR ALL ENTRIES IN gt_po_raw
    WHERE ebeln = gt_po_raw-ebeln
      AND ebelp = gt_po_raw-ebelp
      AND ( vgabe = '1' OR vgabe = '2' ).
  "같은 날짜 고려해서 belnr DESCENDING.까지 처리
  SORT gt_po_hist BY ebeln ebelp budat DESCENDING belnr DESCENDING.

*------------------------------------------------------------------*
* 2. EKBE Sum + Latest Doc
*------------------------------------------------------------------*
  LOOP AT gt_po_hist INTO gs_po_hist.

    lv_sign = 1.
    IF gs_po_hist-bwart = '102'
     OR gs_po_hist-bwart = '122'
     OR gs_po_hist-shkzg = 'H'.
      lv_sign = -1.
    ENDIF.

    READ TABLE gt_po_doc INTO gs_po_doc
         WITH KEY ebeln = gs_po_hist-ebeln
                  ebelp = gs_po_hist-ebelp.
    "값 못 찾았을 경우 밑으로 내려감 값 한개만 얻을 수 있음.
    IF sy-subrc <> 0.
      CLEAR gs_po_doc.
      gs_po_doc-ebeln = gs_po_hist-ebeln.
      gs_po_doc-ebelp = gs_po_hist-ebelp.
      APPEND gs_po_doc TO gt_po_doc.
      "방금 append한 그 row 읽기
      READ TABLE gt_po_doc INTO gs_po_doc INDEX sy-tabix.
    ENDIF.

    CASE gs_po_hist-vgabe.
      WHEN '1'.
        gs_po_doc-gr_qty = gs_po_doc-gr_qty + ( gs_po_hist-menge * lv_sign ).
        gs_po_doc-gr_amt = gs_po_doc-gr_amt + ( gs_po_hist-dmbtr * lv_sign ).
        gs_po_doc-gr_cnt = gs_po_doc-gr_cnt + 1.

        IF gs_po_doc-gr_belnr IS INITIAL.
          gs_po_doc-gr_belnr = gs_po_hist-belnr.
          gs_po_doc-gr_gjahr = gs_po_hist-gjahr.
        ENDIF.

      WHEN '2'.
        gs_po_doc-iv_amt = gs_po_doc-iv_amt + ( gs_po_hist-dmbtr * lv_sign ).
        gs_po_doc-iv_cnt = gs_po_doc-iv_cnt + 1.

        IF gs_po_doc-iv_belnr IS INITIAL.
          gs_po_doc-iv_belnr = gs_po_hist-belnr.
          gs_po_doc-iv_gjahr = gs_po_hist-gjahr.
        ENDIF.
    ENDCASE.

    MODIFY gt_po_doc FROM gs_po_doc INDEX sy-tabix.

  ENDLOOP.

  SORT gt_po_doc BY ebeln ebelp.

ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  MAKE_ALV_PO_DATA
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*  -->  p1        text
*  <--  p2        text
*----------------------------------------------------------------------*
FORM make_alv_po_data .

  DATA: lv_open_qty TYPE ekpo-menge.

  CLEAR gt_alv_po.
  REFRESH gt_alv_po.

  LOOP AT gt_po_raw INTO gs_po_raw.

    CLEAR gs_alv_po.
    MOVE-CORRESPONDING gs_po_raw TO gs_alv_po.

    READ TABLE gt_po_doc INTO gs_po_doc
         WITH KEY ebeln = gs_po_raw-ebeln
                  ebelp = gs_po_raw-ebelp
         BINARY SEARCH.
    IF sy-subrc = 0.
      gs_alv_po-gr_qty   = gs_po_doc-gr_qty.
      gs_alv_po-gr_amt   = gs_po_doc-gr_amt.
      gs_alv_po-iv_amt   = gs_po_doc-iv_amt.
      gs_alv_po-gr_belnr = gs_po_doc-gr_belnr.
      gs_alv_po-gr_gjahr = gs_po_doc-gr_gjahr.
      gs_alv_po-iv_belnr = gs_po_doc-iv_belnr.
      gs_alv_po-iv_gjahr = gs_po_doc-iv_gjahr.

      IF gs_po_doc-gr_cnt = 1.
        gs_alv_po-gr_doc = gs_po_doc-gr_belnr.
      ELSEIF gs_po_doc-gr_cnt > 1.
        gs_alv_po-gr_doc = icon_display_more.
      ENDIF.

      IF gs_po_doc-iv_cnt = 1.
        gs_alv_po-iv_doc = gs_po_doc-iv_belnr.
      ELSEIF gs_po_doc-iv_cnt > 1.
        gs_alv_po-iv_doc = icon_display_more.
      ENDIF.
    ENDIF.

    lv_open_qty = gs_alv_po-po_qty - gs_alv_po-gr_qty.
    gs_alv_po-open_qty = lv_open_qty.

*--- 기본 입력값 : Open Qty
    gs_alv_po-gr_proc_qty = CONV decfloat16( gs_alv_po-open_qty ).

*--- Status 신호등
    IF gs_alv_po-gr_belnr IS NOT INITIAL
   AND gs_alv_po-iv_belnr IS NOT INITIAL.
      gs_alv_po-status = icon_green_light.
    ELSEIF gs_alv_po-gr_belnr IS NOT INITIAL
        OR gs_alv_po-iv_belnr IS NOT INITIAL.
      gs_alv_po-status = icon_yellow_light.
    ELSE.
      gs_alv_po-status = icon_red_light.
    ENDIF.

    APPEND gs_alv_po TO gt_alv_po.

  ENDLOOP.
ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  MAKE_ALV_SUMMARY_DATA
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*  -->  p1        text
*  <--  p2        text
*----------------------------------------------------------------------*
FORM make_alv_summary_data .

  LOOP AT gt_alv_po INTO gs_alv_po.

    " Vendor Summary
    CLEAR gs_alv_vendor.
    gs_alv_vendor-lifnr    = gs_alv_po-lifnr.
    gs_alv_vendor-name1    = gs_alv_po-name1.
    gs_alv_vendor-po_qty   = gs_alv_po-po_qty.
    gs_alv_vendor-open_qty = gs_alv_po-open_qty.
    gs_alv_vendor-po_amt   = gs_alv_po-po_amt.
    gs_alv_vendor-gr_qty   = gs_alv_po-gr_qty.
    gs_alv_vendor-gr_amt   = gs_alv_po-gr_amt.
    gs_alv_vendor-iv_amt   = gs_alv_po-iv_amt.

    COLLECT gs_alv_vendor INTO gt_alv_vendor.

    " Material Summary
    IF gs_alv_po-matnr IS NOT INITIAL.
      CLEAR gs_alv_material.
      gs_alv_material-matnr    = gs_alv_po-matnr.
      gs_alv_material-maktx    = gs_alv_po-maktx.
      gs_alv_material-po_qty   = gs_alv_po-po_qty.
      gs_alv_material-open_qty = gs_alv_po-open_qty.
      gs_alv_material-po_amt   = gs_alv_po-po_amt.
      gs_alv_material-gr_qty   = gs_alv_po-gr_qty.
      gs_alv_material-gr_amt   = gs_alv_po-gr_amt.
      gs_alv_material-iv_amt   = gs_alv_po-iv_amt.

      COLLECT gs_alv_material INTO gt_alv_material.
    ENDIF.

  ENDLOOP.

  SORT gt_alv_vendor   BY lifnr.
  SORT gt_alv_material BY matnr.

ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  CREATE_ALV_OBJECTS
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*  -->  p1        text
*  <--  p2        text
*----------------------------------------------------------------------*
FORM create_alv_objects .

  IF go_container_alv1 IS INITIAL.

* Container ALV1
    CREATE OBJECT go_container_alv1
      EXPORTING
        container_name = 'ALV1'.

* Container ALV2
    CREATE OBJECT go_container_alv2
      EXPORTING
        container_name = 'ALV2'.

* Split ALV2
    CREATE OBJECT go_split_alv2
      EXPORTING
        parent  = go_container_alv2
        rows    = 2
        columns = 1.

* Vendor Container
    CALL METHOD go_split_alv2->get_container
      EXPORTING
        row       = 1
        column    = 1
      RECEIVING
        container = go_container_vendor.

* Material Container
    CALL METHOD go_split_alv2->get_container
      EXPORTING
        row       = 2
        column    = 1
      RECEIVING
        container = go_container_material.

* ALV PO
    CREATE OBJECT go_alv_po
      EXPORTING
        i_parent = go_container_alv1.

* ALV Vendor
    CREATE OBJECT go_alv_vendor
      EXPORTING
        i_parent = go_container_vendor.

* ALV Material
    CREATE OBJECT go_alv_material
      EXPORTING
        i_parent = go_container_material.

    IF go_event IS INITIAL.
      CREATE OBJECT go_event.
      SET HANDLER go_event->handle_toolbar FOR go_alv_po.
      SET HANDLER go_event->handle_user_command FOR go_alv_po.
      SET HANDLER go_event->handle_hotspot_click FOR go_alv_po.
      SET HANDLER go_event->handle_double_click  FOR go_alv_po.
    ENDIF.

  ENDIF.
ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  DISPLAY_ALV1
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*  -->  p1        text
*  <--  p2        text
*----------------------------------------------------------------------*
FORM display_alv1 .

  CLEAR gt_fcat_po.

  PERFORM append_fcat_po USING:
    'STATUS'   'Status'            ''  ''  6,
    'EBELN'    'PO Num.'           ''  '' 10,
    'EBELP'    'Item'              ''  ''  5,
    'BANFN'    'Pur Req.'          ''  '' 10,
    'BNFPO'    'Item'              ''  ''  5,
    'LIFNR'    'Vendor'            ''  '' 10,
    'NAME1'    'Name'              ''  '' 15,
    'MATNR'    'Material'          ''  '' 18,
    'MAKTX'    'Material description' '' '' 25,
    'WERKS'    'Plant'             ''  ''  6,
    'LGORT'    'S/L'               ''  ''  6,
    'PO_QTY'   'PO Qty'            ''  '' 10,
    'MEINS'       'Unit'           ''  ''  6,
    'OPEN_QTY' 'Open PO Qty'       ''  '' 12,
    'GR_PROC_QTY' 'GR Proc.Qty'    ''  'X' 12,
    'NETPR'    'Net price'         ''  '' 12,
    'WAERS'    'CUR'               ''  ''  5,
    'PO_AMT'   'PO Amount'         ''  '' 12,
    'GR_DOC'      'GR Doc'         ''  '' 10,
    'GR_GJAHR' 'Year'              ''  ''  6,
    'GR_QTY'   'GR QTY'            ''  '' 10,
    'GR_AMT'   'GR Amount'         ''  '' 12,
    'IV_DOC'      'IV Doc.'        ''  '' 10,
    'IV_GJAHR' 'Year'              ''  ''  6,
    'IV_AMT'   'IV Amount'         ''  '' 12.

  PERFORM set_fcat_po_properties.

  CLEAR gs_layo_po.
  gs_layo_po-zebra      = 'X'.
  gs_layo_po-cwidth_opt = 'X'.
  gs_layo_po-sel_mode   = 'D'.
  gs_layo_po-grid_title = '<PO 기준 정렬>'.

  CALL METHOD go_alv_po->set_table_for_first_display
    EXPORTING
      is_layout       = gs_layo_po
    CHANGING
      it_outtab       = gt_alv_po
      it_fieldcatalog = gt_fcat_po.

ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  SET_FCAT_PO_PROPERTIES
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*  -->  p1        text
*  <--  p2        text
*----------------------------------------------------------------------*
FORM set_fcat_po_properties .

  LOOP AT gt_fcat_po INTO gs_fcat_po.
    CASE gs_fcat_po-fieldname.
      WHEN 'STATUS'
        OR 'EBELN'
        OR 'EBELP'
        OR 'BANFN'
        OR 'BNFPO'
        OR 'LIFNR'
        OR 'NAME1'.
        gs_fcat_po-fix_column = 'X'.
      WHEN OTHERS.
        CLEAR gs_fcat_po-fix_column.
    ENDCASE.

    CASE gs_fcat_po-fieldname.
      WHEN 'STATUS'.
        gs_fcat_po-icon = 'X'.
    ENDCASE.

    CASE gs_fcat_po-fieldname.
      WHEN 'EBELN'
        OR 'MATNR'.
        gs_fcat_po-hotspot = 'X'.
    ENDCASE.

    IF gs_fcat_po-fieldname = 'GR_PROC_QTY'.
      gs_fcat_po-edit = 'X'. "이컬럼만 수정가능함을 의미
    ENDIF.

    CASE gs_fcat_po-fieldname.
      WHEN 'OPEN_QTY'
        OR 'GR_QTY'
        OR 'GR_AMT'
        OR 'IV_AMT'
        OR 'PO_AMT'
        OR 'NETPR'.
        gs_fcat_po-no_zero = 'X'.
    ENDCASE.

    CASE gs_fcat_po-fieldname.
      WHEN 'PO_QTY'
        OR 'OPEN_QTY'
        OR 'GR_QTY'.
        gs_fcat_po-qfieldname = 'MEINS'.
    ENDCASE.

    CASE gs_fcat_po-fieldname.
      WHEN 'NETPR'
        OR 'PO_AMT'
        OR 'GR_AMT'
        OR 'IV_AMT'.
        gs_fcat_po-cfieldname = 'WAERS'.
    ENDCASE.

    MODIFY gt_fcat_po FROM gs_fcat_po.
  ENDLOOP.

ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  DISPLAY_ALV2
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*  -->  p1        text
*  <--  p2        text
*----------------------------------------------------------------------*
FORM display_alv2 .

  CLEAR gt_fcat_vendor.

  PERFORM append_fcat_vendor USING:
    'LIFNR'    'Vendor'         10,
    'NAME1'    'Name'           15,
    'PO_QTY'   'PO Quantity'    12,
    'OPEN_QTY' 'Open PO Q''ty'  12,
    'PO_AMT'   'PO Amount'      12,
    'GR_QTY'   'GR Q''TY'       12,
    'GR_AMT'   'GR Amount'      12,
    'IV_AMT'   'IV Amount'      12.

  CLEAR gs_layo_vendor.
  gs_layo_vendor-zebra      = 'X'.
  gs_layo_vendor-cwidth_opt = 'X'.
  gs_layo_vendor-sel_mode   = 'A'.
  gs_layo_vendor-grid_title = '<Vendor 기준 정렬>'.

  LOOP AT gt_fcat_vendor INTO gs_fcat_vendor.
    CASE gs_fcat_vendor-fieldname.
      WHEN 'OPEN_QTY'
        OR 'GR_QTY'
        OR 'GR_AMT'
        OR 'IV_AMT'
        OR 'PO_AMT'.
        gs_fcat_vendor-no_zero = 'X'.
    ENDCASE.
    MODIFY gt_fcat_vendor FROM gs_fcat_vendor.
  ENDLOOP.

  CALL METHOD go_alv_vendor->set_table_for_first_display
    EXPORTING
      is_layout       = gs_layo_vendor
    CHANGING
      it_outtab       = gt_alv_vendor
      it_fieldcatalog = gt_fcat_vendor.

  CLEAR gt_fcat_material.

  PERFORM append_fcat_material USING:
    'MATNR'    'Material'              18,
    'MAKTX'    'Material description'  25,
    'PO_QTY'   'PO Quantity'           12,
    'OPEN_QTY' 'Open PO Q''ty'         12,
    'PO_AMT'   'PO Amount'             12,
    'GR_QTY'   'GR Q''TY'              12,
    'GR_AMT'   'GR Amount'             12,
    'IV_AMT'   'IV Amount'             12.

  CLEAR gs_layo_material.
  gs_layo_material-zebra      = 'X'.
  gs_layo_material-cwidth_opt = 'X'.
  gs_layo_material-sel_mode   = 'A'.
  gs_layo_material-grid_title = '<Material 기준 정렬>'.

  LOOP AT gt_fcat_material INTO gs_fcat_material.
    CASE gs_fcat_material-fieldname.
      WHEN 'OPEN_QTY'
        OR 'GR_QTY'
        OR 'GR_AMT'
        OR 'IV_AMT'
        OR 'PO_AMT'.
        gs_fcat_material-no_zero = 'X'.
    ENDCASE.
    MODIFY gt_fcat_material FROM gs_fcat_material.
  ENDLOOP.

  CALL METHOD go_alv_material->set_table_for_first_display
    EXPORTING
      is_layout       = gs_layo_material
    CHANGING
      it_outtab       = gt_alv_material
      it_fieldcatalog = gt_fcat_material.
ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  APPEND_FCAT_PO
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*      -->P_0104   text
*      -->P_0105   text
*      -->P_0106   text
*      -->P_0107   text
*      -->P_4      text
*----------------------------------------------------------------------*
FORM append_fcat_po  USING    pv_field
                              pv_text
                              pv_checkbox
                              pv_edit
                              pv_len.

  CLEAR gs_fcat_po.
  gs_fcat_po-fieldname = pv_field.
  gs_fcat_po-coltext   = pv_text.
  gs_fcat_po-scrtext_l = pv_text.
  gs_fcat_po-scrtext_m = pv_text.
  gs_fcat_po-scrtext_s = pv_text.
  gs_fcat_po-outputlen = pv_len.

  IF pv_checkbox = 'X'.
    gs_fcat_po-checkbox = 'X'.
    gs_fcat_po-edit     = 'X'.
  ENDIF.

  IF pv_edit = 'X'.
    gs_fcat_po-edit = 'X'.
  ENDIF.

  APPEND gs_fcat_po TO gt_fcat_po.

ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  APPEND_FCAT_VENDOR
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*      -->P_0412   text
*      -->P_0413   text
*      -->P_10     text
*----------------------------------------------------------------------*
FORM append_fcat_vendor USING pv_field
                              pv_text
                              pv_len.

  CLEAR gs_fcat_vendor.
  gs_fcat_vendor-fieldname = pv_field.
  gs_fcat_vendor-coltext   = pv_text.
  gs_fcat_vendor-scrtext_l = pv_text.
  gs_fcat_vendor-scrtext_m = pv_text.
  gs_fcat_vendor-scrtext_s = pv_text.
  gs_fcat_vendor-outputlen = pv_len.

  APPEND gs_fcat_vendor TO gt_fcat_vendor.

ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  APPEND_FCAT_MATERIAL
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*      -->P_0487   text
*      -->P_0488   text
*      -->P_18     text
*----------------------------------------------------------------------*
FORM append_fcat_material USING pv_field
                                pv_text
                                pv_len.

  CLEAR gs_fcat_material.
  gs_fcat_material-fieldname = pv_field.
  gs_fcat_material-coltext   = pv_text.
  gs_fcat_material-scrtext_l = pv_text.
  gs_fcat_material-scrtext_m = pv_text.
  gs_fcat_material-scrtext_s = pv_text.
  gs_fcat_material-outputlen = pv_len.

  APPEND gs_fcat_material TO gt_fcat_material.

ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  SHOW_DOCFLOW
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*      -->P_LS_PO_EBELN  text
*      -->P_LS_PO_EBELP  text
*----------------------------------------------------------------------*
FORM show_docflow USING p_ebeln
                        p_ebelp.

  DATA: ls_doc TYPE ty_po_doc,
        ls_po  TYPE ty_alv_po.

  CLEAR: gv_po_no, gv_item_no,
         gv_gr_doc, gv_gr_year, gv_gr_qty, gv_gr_amt,
         gv_iv_doc, gv_iv_year, gv_iv_amt,
         gv_gr_mode, gv_ir_mode, gv_subscreen.

  REFRESH: gt_doc_gr, gt_doc_ir.

  READ TABLE gt_alv_po INTO ls_po
        WITH KEY ebeln = p_ebeln
                 ebelp = p_ebelp.
  IF sy-subrc <> 0.
    MESSAGE s001(00) WITH '선택한 PO 데이터를 찾을 수 없습니다.' DISPLAY LIKE 'E'.
    RETURN.
  ENDIF.

  READ TABLE gt_po_doc INTO ls_doc
       WITH KEY ebeln = p_ebeln
                ebelp = p_ebelp.
  IF sy-subrc <> 0.
    MESSAGE s001(00) WITH '문서흐름 정보가 없습니다.' DISPLAY LIKE 'E'.
    RETURN.
  ENDIF.

  IF ls_doc-gr_cnt = 0 AND ls_doc-iv_cnt = 0.
    MESSAGE s001(00) WITH 'GR/IV 문서 이력이 없습니다.' DISPLAY LIKE 'E'.
    RETURN.
  ENDIF.

  gv_po_no   = p_ebeln.
  gv_item_no = p_ebelp.

  IF ls_doc-gr_cnt > 1.
    gv_gr_mode = 'M'.
  ELSE.
    gv_gr_mode = 'S'.
  ENDIF.

  IF ls_doc-iv_cnt > 1.
    gv_ir_mode = 'M'.
  ELSE.
    gv_ir_mode = 'S'.
  ENDIF.

  IF gv_gr_mode = 'M' OR gv_ir_mode = 'M'.
    PERFORM build_docflow_multi USING p_ebeln p_ebelp.
  ENDIF.

  gv_gr_doc  = ls_po-gr_belnr.
  gv_gr_year = ls_po-gr_gjahr.
  gv_gr_qty  = ls_po-gr_qty.
  gv_gr_amt  = ls_po-gr_amt.

  gv_iv_doc  = ls_po-iv_belnr.
  gv_iv_year = ls_po-iv_gjahr.
  gv_iv_amt  = ls_po-iv_amt.

  CALL SCREEN 200 STARTING AT 30 5 ENDING AT 100 20.

ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  BUILD_DOCFLOW_MULTI
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*      -->P_P_EBELN  text
*      -->P_P_EBELP  text
*----------------------------------------------------------------------*
FORM build_docflow_multi  USING    p_ebeln
                                   p_ebelp.

  DATA: ls_hist TYPE ty_po_hist.
  DATA lv_sign TYPE i.

  REFRESH: gt_doc_gr, gt_doc_ir.

  LOOP AT gt_po_hist INTO ls_hist
       WHERE ebeln = p_ebeln
         AND ebelp = p_ebelp.

    lv_sign = 1.

    IF ls_hist-bwart = '102'
     OR ls_hist-bwart = '122'
     OR ls_hist-shkzg = 'H'.
      lv_sign = -1.
    ENDIF.

    CASE ls_hist-vgabe.
      WHEN '1'. " GR
        CLEAR gs_doc_gr.
        gs_doc_gr-pur_no  = p_ebeln.
        gs_doc_gr-item_no = p_ebelp.
        gs_doc_gr-gr_doc  = ls_hist-belnr.
        gs_doc_gr-gr_year = ls_hist-gjahr.
        gs_doc_gr-gr_qty  = ls_hist-menge * lv_sign.
        gs_doc_gr-gr_amt  = ls_hist-dmbtr * lv_sign.
        APPEND gs_doc_gr TO gt_doc_gr.

      WHEN '2'. " IR
        CLEAR gs_doc_ir.
        gs_doc_ir-pur_no  = p_ebeln.
        gs_doc_ir-item_no = p_ebelp.
        gs_doc_ir-iv_doc  = ls_hist-belnr.
        gs_doc_ir-iv_year = ls_hist-gjahr.
        gs_doc_ir-iv_amt  = ls_hist-dmbtr * lv_sign.
        APPEND gs_doc_ir TO gt_doc_ir.
    ENDCASE.

  ENDLOOP.

ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  CREATE_GR_ALV_OBJECTS
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*  -->  p1        text
*  <--  p2        text
*----------------------------------------------------------------------*
FORM create_gr_alv_objects .

  IF go_container_gr IS INITIAL.
    CREATE OBJECT go_container_gr
      EXPORTING
        container_name = 'CC_GR_ALV'.

    CREATE OBJECT go_alv_gr
      EXPORTING
        i_parent = go_container_gr.
  ENDIF.

ENDFORM.

FORM create_ir_alv_objects .

  IF go_container_ir IS INITIAL.
    CREATE OBJECT go_container_ir
      EXPORTING
        container_name = 'CC_IR_ALV'.

    CREATE OBJECT go_alv_ir
      EXPORTING
        i_parent = go_container_ir.
  ENDIF.

ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  DISPLAY_GR_ALV
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*  -->  p1        text
*  <--  p2        text
*----------------------------------------------------------------------*
FORM display_gr_alv .

  IF gt_fcat_gr IS INITIAL.
    PERFORM append_fcat_simple USING 'PUR_NO'  'PO Num'    10 CHANGING gt_fcat_gr.
    PERFORM append_fcat_simple USING 'ITEM_NO' 'Item'       5 CHANGING gt_fcat_gr.
    PERFORM append_fcat_simple USING 'GR_DOC'  'GR Doc.'   10 CHANGING gt_fcat_gr.
    PERFORM append_fcat_simple USING 'GR_YEAR' 'GR Year'    6 CHANGING gt_fcat_gr.
    PERFORM append_fcat_simple USING 'GR_QTY'  'GR Qty'    10 CHANGING gt_fcat_gr.
    PERFORM append_fcat_simple USING 'GR_AMT'  'GR Amount' 12 CHANGING gt_fcat_gr.
  ENDIF.

  CLEAR gs_layo_gr.
  gs_layo_gr-zebra      = 'X'.
  gs_layo_gr-cwidth_opt = 'X'.
  gs_layo_gr-grid_title = 'GR Detail'.

  CALL METHOD go_alv_gr->set_table_for_first_display
    EXPORTING
      is_layout       = gs_layo_gr
    CHANGING
      it_outtab       = gt_doc_gr
      it_fieldcatalog = gt_fcat_gr.

ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  DISPLAY_IR_ALV
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*  -->  p1        text
*  <--  p2        text
*----------------------------------------------------------------------*
FORM display_ir_alv .

  IF gt_fcat_ir IS INITIAL.
    PERFORM append_fcat_simple USING 'PUR_NO'  'PO Num'    10 CHANGING gt_fcat_ir.
    PERFORM append_fcat_simple USING 'ITEM_NO' 'Item'       5 CHANGING gt_fcat_ir.
    PERFORM append_fcat_simple USING 'IV_DOC'  'IR Doc.'   10 CHANGING gt_fcat_ir.
    PERFORM append_fcat_simple USING 'IV_YEAR' 'IR Year'    6 CHANGING gt_fcat_ir.
    PERFORM append_fcat_simple USING 'IV_AMT'  'IR Amount' 12 CHANGING gt_fcat_ir.
  ENDIF.

  CLEAR gs_layo_ir.
  gs_layo_ir-zebra      = 'X'.
  gs_layo_ir-cwidth_opt = 'X'.
  gs_layo_ir-grid_title = 'IR Detail'.

  CALL METHOD go_alv_ir->set_table_for_first_display
    EXPORTING
      is_layout       = gs_layo_ir
    CHANGING
      it_outtab       = gt_doc_ir
      it_fieldcatalog = gt_fcat_ir.


ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  APPEND_FCAT_SIMPLE
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*      -->P_1608   text
*      -->P_1609   text
*      -->P_10     text
*      <--P_GT_FCAT_GR  text
*----------------------------------------------------------------------*
FORM append_fcat_simple USING    p_field
                                 p_text
                                 p_len
                        CHANGING pt_fcat TYPE lvc_t_fcat.

  DATA ls_fcat TYPE lvc_s_fcat.

  CLEAR ls_fcat.
  ls_fcat-fieldname = p_field.
  ls_fcat-coltext   = p_text.
  ls_fcat-outputlen = p_len.

  APPEND ls_fcat TO pt_fcat.

ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  PROCESS_GR_CREATE
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*  -->  p1        text
*  <--  p2        text
*----------------------------------------------------------------------*
FORM process_gr_create .

  DATA: ls_po               TYPE ty_alv_po,
        ls_goodsmvt_header  TYPE bapi2017_gm_head_01,
        ls_goodsmvt_code    TYPE bapi2017_gm_code,
        lt_goodsmvt_item    TYPE TABLE OF bapi2017_gm_item_create,
        ls_goodsmvt_item    TYPE bapi2017_gm_item_create,
        ls_goodsmvt_headret TYPE bapi2017_gm_head_ret,
        lt_return           TYPE TABLE OF bapiret2,
        ls_return           TYPE bapiret2,
        lv_msg              TYPE char200.

  PERFORM get_selected_po_row CHANGING ls_po.
  IF ls_po-ebeln IS INITIAL.
    RETURN.
  ENDIF.

  IF ls_po-gr_proc_qty IS INITIAL OR ls_po-gr_proc_qty <= 0.
    MESSAGE 'GR Proc.Qty에 입고 수량을 입력하세요.' TYPE 'S' DISPLAY LIKE 'E'.
    RETURN.
  ENDIF.

  IF ls_po-open_qty IS INITIAL OR ls_po-open_qty <= 0.
    MESSAGE 'Open PO Qty가 없어 입고 처리할 수 없습니다.' TYPE 'S' DISPLAY LIKE 'E'.
    RETURN.
  ENDIF.

  IF ls_po-gr_proc_qty > ls_po-open_qty.
    MESSAGE '입고 수량은 Open PO Qty를 초과할 수 없습니다.' TYPE 'S' DISPLAY LIKE 'E'.
    RETURN.
  ENDIF.

  IF ls_po-matnr IS INITIAL OR ls_po-werks IS INITIAL.
    MESSAGE 'Material/Plant 정보가 없어 입고 처리할 수 없습니다.' TYPE 'S' DISPLAY LIKE 'E'.
    RETURN.
  ENDIF.

  CLEAR: ls_goodsmvt_header, ls_goodsmvt_code, ls_goodsmvt_headret.
  REFRESH: lt_goodsmvt_item, lt_return.

  ls_goodsmvt_header-pstng_date = sy-datum.
  ls_goodsmvt_header-doc_date   = sy-datum.
  ls_goodsmvt_header-ref_doc_no = ls_po-ebeln.

  ls_goodsmvt_code-gm_code = '01'.

  CLEAR ls_goodsmvt_item.
  ls_goodsmvt_item-material  = ls_po-matnr.
  ls_goodsmvt_item-plant     = ls_po-werks.
  ls_goodsmvt_item-stge_loc  = ls_po-lgort.
  ls_goodsmvt_item-move_type = '101'.
  ls_goodsmvt_item-mvt_ind   = 'B'.
  ls_goodsmvt_item-po_number = ls_po-ebeln.
  ls_goodsmvt_item-po_item   = ls_po-ebelp.
  ls_goodsmvt_item-entry_qnt = CONV bapi2017_gm_item_create-entry_qnt( ls_po-gr_proc_qty ).
  ls_goodsmvt_item-entry_uom = ls_po-meins.
  APPEND ls_goodsmvt_item TO lt_goodsmvt_item.

  CALL FUNCTION 'BAPI_GOODSMVT_CREATE'
    EXPORTING
      goodsmvt_header  = ls_goodsmvt_header
      goodsmvt_code    = ls_goodsmvt_code
    IMPORTING
      goodsmvt_headret = ls_goodsmvt_headret
    TABLES
      goodsmvt_item    = lt_goodsmvt_item
      return           = lt_return.

  CLEAR lv_msg.
  LOOP AT lt_return INTO ls_return WHERE type = 'A' OR type = 'E' OR type = 'X'.
    lv_msg = ls_return-message.
    EXIT.
  ENDLOOP.

  IF lv_msg IS NOT INITIAL.
    CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
    MESSAGE lv_msg TYPE 'S' DISPLAY LIKE 'E'.
    RETURN.
  ENDIF.

  CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
    EXPORTING
      wait = 'X'.

  PERFORM get_data.
  PERFORM refresh_main_alv.

  IF ls_goodsmvt_headret-mat_doc IS NOT INITIAL.
    CONCATENATE '입고 처리 완료. 자재문서'
                ls_goodsmvt_headret-mat_doc
                ls_goodsmvt_headret-doc_year
           INTO lv_msg SEPARATED BY space.
  ELSE.
    lv_msg = '입고 처리 완료'.
  ENDIF.

  MESSAGE lv_msg TYPE 'S'.

ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  PROCESS_GR_CANCEL
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*  -->  p1        text
*  <--  p2        text
*----------------------------------------------------------------------*
FORM process_gr_cancel .

  DATA: ls_po     TYPE ty_alv_po,
        lt_return TYPE TABLE OF bapiret2,
        ls_return TYPE bapiret2,
        lv_msg    TYPE char200.

  PERFORM get_selected_po_row CHANGING ls_po.
  IF ls_po-ebeln IS INITIAL.
    RETURN.
  ENDIF.

  IF ls_po-gr_belnr IS INITIAL OR ls_po-gr_gjahr IS INITIAL.
    MESSAGE '취소할 GR 문서가 없습니다.' TYPE 'S' DISPLAY LIKE 'E'.
    RETURN.
  ENDIF.

  IF ls_po-gr_doc = icon_display_more.
    MESSAGE '여러 GR 문서가 있는 건은 Doc Flow에서 확인 후 취소하세요.' TYPE 'S' DISPLAY LIKE 'E'.
    RETURN.
  ENDIF.

  REFRESH lt_return.
  CLEAR lv_msg.

  CALL FUNCTION 'BAPI_GOODSMVT_CANCEL'
    EXPORTING
      materialdocument    = ls_po-gr_belnr
      matdocumentyear     = ls_po-gr_gjahr
      goodsmvt_pstng_date = sy-datum
    TABLES
      return              = lt_return.

  LOOP AT lt_return INTO ls_return WHERE type = 'A' OR type = 'E' OR type = 'X'.
    lv_msg = ls_return-message.
    EXIT.
  ENDLOOP.

  IF lv_msg IS NOT INITIAL.
    CALL FUNCTION 'BAPI_TRANSACTION_ROLLBACK'.
    MESSAGE lv_msg TYPE 'S' DISPLAY LIKE 'E'.
    RETURN.
  ENDIF.

  CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
    EXPORTING
      wait = 'X'.

  PERFORM get_data.
  PERFORM refresh_main_alv.

  CONCATENATE '입고 취소 완료. 자재문서'
              ls_po-gr_belnr
              ls_po-gr_gjahr
         INTO lv_msg SEPARATED BY space.

  MESSAGE lv_msg TYPE 'S'.

ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  GET_SELECTED_PO_ROW
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*      <--P_LS_PO  text
*----------------------------------------------------------------------*
FORM get_selected_po_row  CHANGING ps_po TYPE ty_alv_po.

  DATA: lt_rows TYPE lvc_t_row,
        ls_row  TYPE lvc_s_row.

  CLEAR ps_po.

  CALL METHOD go_alv_po->get_selected_rows
    IMPORTING
      et_index_rows = lt_rows.

  IF lt_rows IS INITIAL.
    MESSAGE '처리할 행을 선택하세요.' TYPE 'S' DISPLAY LIKE 'E'.
    EXIT.
  ENDIF.

  IF lines( lt_rows ) > 1.
    MESSAGE '한 건만 선택하세요.' TYPE 'S' DISPLAY LIKE 'E'.
    EXIT.
  ENDIF.

  READ TABLE lt_rows INTO ls_row INDEX 1.
  IF sy-subrc <> 0.
    MESSAGE '선택 행을 읽을 수 없습니다.' TYPE 'S' DISPLAY LIKE 'E'.
    EXIT.
  ENDIF.

  READ TABLE gt_alv_po INTO ps_po INDEX ls_row-index.
  IF sy-subrc <> 0.
    CLEAR ps_po.
    MESSAGE '선택 데이터를 찾을 수 없습니다.' TYPE 'S' DISPLAY LIKE 'E'.
    EXIT.
  ENDIF.

ENDFORM.
*&---------------------------------------------------------------------*
*&      Form  REFRESH_MAIN_ALV
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
*  -->  p1        text
*  <--  p2        text
*----------------------------------------------------------------------*
FORM refresh_main_alv .

  DATA ls_stbl TYPE lvc_s_stbl.

  ls_stbl-row = 'X'.
  ls_stbl-col = 'X'.

  IF go_alv_po IS BOUND.
    CALL METHOD go_alv_po->refresh_table_display
      EXPORTING
        is_stable = ls_stbl.
  ENDIF.

  IF go_alv_vendor IS BOUND.
    CALL METHOD go_alv_vendor->refresh_table_display
      EXPORTING
        is_stable = ls_stbl.
  ENDIF.

  IF go_alv_material IS BOUND.
    CALL METHOD go_alv_material->refresh_table_display
      EXPORTING
        is_stable = ls_stbl.
  ENDIF.


ENDFORM.