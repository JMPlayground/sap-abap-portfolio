*&---------------------------------------------------------------------*
*&  Include           YFDMM_EX2_07_CLS
*&---------------------------------------------------------------------*
CLASS lcl_alv_event DEFINITION.
  PUBLIC SECTION.

    METHODS handle_toolbar
                  FOR EVENT toolbar OF cl_gui_alv_grid
      IMPORTING e_object e_interactive.

    METHODS handle_user_command
                  FOR EVENT user_command OF cl_gui_alv_grid
      IMPORTING e_ucomm.

    METHODS handle_hotspot_click
                  FOR EVENT hotspot_click OF cl_gui_alv_grid
      IMPORTING e_row_id e_column_id.

    METHODS handle_double_click
                  FOR EVENT double_click OF cl_gui_alv_grid
      IMPORTING e_row e_column.

ENDCLASS.


CLASS lcl_alv_event IMPLEMENTATION.

  METHOD handle_toolbar.

    DATA ls_toolbar TYPE stb_button.

    CLEAR ls_toolbar.
    ls_toolbar-function  = 'DOCFLOW'.
    ls_toolbar-text      = 'Doc Flow'.
    ls_toolbar-icon      = icon_display.
    ls_toolbar-quickinfo = 'Document Flow'.

    APPEND ls_toolbar TO e_object->mt_toolbar.

  ENDMETHOD.

  METHOD handle_user_command.

    DATA: lt_rows TYPE lvc_t_row, "인덱스 번호
          ls_row  TYPE lvc_s_row,
          ls_po   TYPE ty_alv_po.

    CASE e_ucomm.
      WHEN 'DOCFLOW'.

        CALL METHOD go_alv_po->get_selected_rows
          IMPORTING
            et_index_rows = lt_rows.

        IF lt_rows IS INITIAL.
          MESSAGE s001(00) WITH 'Doc Flow를 실행할 행을 선택하세요.' DISPLAY LIKE 'E'.
          RETURN. "메시지타입은 S로 해서 화면 멈춤없도록 만듬.
        ENDIF.

        IF lines( lt_rows ) > 1.
          MESSAGE s001(00) WITH '한 건만 선택하세요.' DISPLAY LIKE 'E'.
          RETURN.
        ENDIF.

        READ TABLE lt_rows INTO ls_row INDEX 1.
        IF sy-subrc <> 0.
          MESSAGE s001(00) WITH '선택 행을 읽을 수 없습니다.' DISPLAY LIKE 'E'.
          RETURN.
        ENDIF.

        READ TABLE gt_alv_po INTO ls_po INDEX ls_row-index.
        IF sy-subrc <> 0.
          MESSAGE s001(00) WITH '선택 데이터가 없습니다.' DISPLAY LIKE 'E'.
          RETURN.
        ENDIF.

        PERFORM show_docflow USING ls_po-ebeln ls_po-ebelp.

    ENDCASE.

  ENDMETHOD.

  METHOD handle_hotspot_click.

    DATA ls_po TYPE ty_alv_po.

    READ TABLE gt_alv_po INTO ls_po INDEX e_row_id-index.
    IF sy-subrc <> 0.
      EXIT.
    ENDIF.

    CASE e_column_id-fieldname.

      WHEN 'EBELN'.
        SET PARAMETER ID 'BES' FIELD ls_po-ebeln.
        CALL TRANSACTION 'ME23N' AND SKIP FIRST SCREEN.

      WHEN 'MATNR'.
        SET PARAMETER ID 'MAT' FIELD ls_po-matnr.
        CALL TRANSACTION 'MM03' AND SKIP FIRST SCREEN.
    ENDCASE.

  ENDMETHOD.

  METHOD handle_double_click.

    DATA ls_po TYPE ty_alv_po.

    READ TABLE gt_alv_po INTO ls_po INDEX e_row-index.
    IF sy-subrc <> 0.
      EXIT.
    ENDIF.

    CASE e_column-fieldname.

      WHEN 'LIFNR'.
        SET PARAMETER ID 'LIF' FIELD ls_po-lifnr.
        CALL TRANSACTION 'XK03' AND SKIP FIRST SCREEN.

      WHEN 'BANFN' OR 'BNFPO'.
        IF ls_po-banfn IS INITIAL.
          MESSAGE s001(00) WITH 'PR 문서가 없습니다.' DISPLAY LIKE 'E'.
          RETURN.
        ENDIF.
        SET PARAMETER ID 'BAN' FIELD ls_po-banfn.
        CALL TRANSACTION 'ME53N' AND SKIP FIRST SCREEN.

      WHEN 'GR_DOC'.
        IF ls_po-gr_doc IS INITIAL.
          MESSAGE s001(00) WITH 'GR 문서가 없습니다.' DISPLAY LIKE 'E'.
          RETURN.
        ENDIF.
        gv_pressed_tab = 'TAB1'.
        PERFORM show_docflow USING ls_po-ebeln ls_po-ebelp.

      WHEN 'IV_DOC'.
        IF ls_po-iv_doc IS INITIAL.
          MESSAGE s001(00) WITH 'IV 문서가 없습니다.' DISPLAY LIKE 'E'.
          RETURN.
        ENDIF.
        gv_pressed_tab = 'TAB2'.
        PERFORM show_docflow USING ls_po-ebeln ls_po-ebelp.
    ENDCASE.

  ENDMETHOD.

ENDCLASS.

DATA: go_event TYPE REF TO lcl_alv_event.