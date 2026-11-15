*&---------------------------------------------------------------------*
*&  Include           YFDMM_EX2_07_I01
*&---------------------------------------------------------------------*
*&---------------------------------------------------------------------*
*&      Module  EXIT  INPUT
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
MODULE exit INPUT.

  save_ok = ok_code.
  CLEAR ok_code.
  CASE save_ok.

    WHEN 'BACK'.
      "Selection Screen으로 이동(이전 화면으로 이동)
      LEAVE TO SCREEN 0.

    WHEN 'EXIT' OR 'CANC'.
      LEAVE PROGRAM.

  ENDCASE.
ENDMODULE.
*&---------------------------------------------------------------------*
*&      Module  USER_COMMAND_0100  INPUT
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
MODULE user_command_0100 INPUT.

  save_ok = ok_code.
  CLEAR ok_code.

  CASE save_ok.
    WHEN 'GR'.
      CALL METHOD go_alv_po->check_changed_data.
      PERFORM process_gr_create.

    WHEN 'CANCEL'.
      CALL METHOD go_alv_po->check_changed_data.
      PERFORM process_gr_cancel.
  ENDCASE.

ENDMODULE.
*&---------------------------------------------------------------------*
*&      Module  EXIT_0200  INPUT
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
MODULE exit_0200 INPUT.

  CASE ok_code.
    WHEN 'EXIT' OR 'BACK' OR 'CANC'.
      LEAVE TO SCREEN 0.
  ENDCASE.

ENDMODULE.
*&---------------------------------------------------------------------*
*&      Module  EXIT_0210  INPUT
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
MODULE exit_0210 INPUT.

  CASE sy-ucomm.
    WHEN 'EXIT' OR 'BACK' OR 'CANC'.
      LEAVE TO SCREEN 0.
  ENDCASE.

ENDMODULE.
*&---------------------------------------------------------------------*
*&      Module  USER_COMMAND_0200  INPUT
*&---------------------------------------------------------------------*
*       text
*----------------------------------------------------------------------*
MODULE user_command_0200 INPUT.

  save_ok = ok_code.
  CLEAR ok_code.

  CASE save_ok.
    WHEN 'TAB1' OR 'TAB2'.
      gv_pressed_tab = save_ok.
  ENDCASE.

ENDMODULE.
