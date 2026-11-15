*&---------------------------------------------------------------------*
*&  Include           YFDMM_EX2_07_O01
*&---------------------------------------------------------------------*
*&---------------------------------------------------------------------*
*&      Module  STATUS_0100  OUTPUT
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
MODULE status_0100 OUTPUT.
  SET PF-STATUS '0100'.
  SET TITLEBAR '0100'.
ENDMODULE.
*&---------------------------------------------------------------------*
*&      Module  CREATE_ALV  OUTPUT
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
MODULE create_alv OUTPUT.
  PERFORM create_alv_objects.
  PERFORM display_alv1.
  PERFORM display_alv2.
ENDMODULE.
*&---------------------------------------------------------------------*
*&      Module  STATUS_0200  OUTPUT
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
MODULE status_0200 OUTPUT.

  SET PF-STATUS '0200'.
  SET TITLEBAR '0200' WITH gv_po_no gv_item_no.

ENDMODULE.
*&---------------------------------------------------------------------*
*&      Module  SET_SUBSCREEN  OUTPUT
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
MODULE set_subscreen OUTPUT.

  CASE gv_pressed_tab.
    WHEN 'TAB1'.
      tc_docflow-activetab = 'TAB1'.
      IF gv_gr_mode = 'M'.
        gv_subscreen = '0210'.
      ELSE.
        gv_subscreen = '0201'.
      ENDIF.

    WHEN 'TAB2'.
      tc_docflow-activetab = 'TAB2'.
      IF gv_ir_mode = 'M'.
        gv_subscreen = '0211'.
      ELSE.
        gv_subscreen = '0202'.
      ENDIF.
  ENDCASE.

ENDMODULE.
*&---------------------------------------------------------------------*
*&      Module  CREATE_GR_ALV  OUTPUT
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
MODULE create_gr_alv OUTPUT.
  PERFORM create_gr_alv_objects.
  PERFORM display_gr_alv.
ENDMODULE.
*&---------------------------------------------------------------------*
*&      Module  CREATE_IR_ALV  OUTPUT
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
MODULE create_ir_alv OUTPUT.
  PERFORM create_ir_alv_objects.
  PERFORM display_ir_alv.

ENDMODULE.
