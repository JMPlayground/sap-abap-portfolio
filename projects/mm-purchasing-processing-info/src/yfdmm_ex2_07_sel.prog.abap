*&---------------------------------------------------------------------*
*&  Include           YFDMM_EX2_07_SEL
*&---------------------------------------------------------------------*

SELECTION-SCREEN BEGIN OF BLOCK b1 WITH FRAME TITLE text-t01.

SELECT-OPTIONS:
  s_bukrs FOR ekko-bukrs NO INTERVALS OBLIGATORY,
  s_werks FOR ekpo-werks,
  s_matnr FOR ekpo-matnr,
  s_lifnr FOR ekko-lifnr,
  s_ebeln FOR ekpo-ebeln,
  s_ekorg FOR ekko-ekorg,
  s_ekgrp FOR ekko-ekgrp,
  s_pstyp FOR ekpo-pstyp,
  s_knttp FOR ekpo-knttp.

PARAMETERS:
  p_del AS CHECKBOX.

SELECTION-SCREEN END OF BLOCK b1.
