#lang racket

(require sxml)

(define temp/hum-sensors
  '(outside
    bedroom
    living_room
    bathroom
    kitchen))

(for/list ([sensor (in-list temp/hum-sensors)])
  `(td (@ (class "well")
          (ng-class ,(~a "s_temp_obj_concern."sensor)))
      ,(~a "{{s_temp_obj_display."sensor"}}")))



