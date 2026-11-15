PROCESS BEFORE OUTPUT.
  MODULE status_0200.
  MODULE set_subscreen.
  CALL SUBSCREEN sub_doc INCLUDING sy-repid gv_subscreen.
  "Program/subscreen: flow logic grammar.

PROCESS AFTER INPUT.
  CALL SUBSCREEN sub_doc. "서브스크린안의 pai 처리 먼저가 정석
  MODULE exit_0200 AT EXIT-COMMAND.
  MODULE user_command_0200.
