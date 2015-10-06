#lang racket

(require web-server/templates
         racket/runtime-path
         xml)

(define-runtime-path main "..")

;; plug vars into the index page template
(define (make-index-page elec-use-rows)
  (include-template "index-template.html"))

(define some-elec-gen-devices
  '(("LAUNDRY" laundry)
    ("DISHWASHER" dishwasher)
    ("REFRIGERATOR" refrigerator)
    ("COOKTOP" induction_stove)
    ("MICROWAVE" microwave)
    ("WATER HEATER" water_heater)
    ("GREYWATER" greywater_pump)
    ("BLACKWATER" blackwater_pump)
    ("THERMAL LOOP" thermal_loop_pump)
    ("WATER SUPPLY" water_supply_pump) ;; FIXME!
    ("VEHICLE" vehicle_charging)
    ("MECH OUTS" mechanical_room_outlets)
    ("HEAT PUMP" heat_pump)
    ("AIR HANDLER" air_handler)
    ("A/C" air_conditioning)
    ("LIGHTING" lighting_1) ;; FIXME

))


;; build a row of the electrical use table:
(define (elec-use-row some-devices first?)
  `(div ((class "homepageDataTable"))
        ,@(cond [first? (list `(div ((class "tableHeader"))
                                    "ENERGY USE TODAY (kWh)"))]
                [else (list)])
        (table ,(make-titles-row some-devices)
               ,(make-contents-row some-devices))))

;; not trying to quote. Could be ugly.
(define (handlebars str)
  (~a "{{"str"}}"))

(define (make-titles-row devices)
  (cons 'tr
        (for/list ([device-pair (in-list devices)])
          `(th ,(first device-pair)))))

(define (make-contents-row devices)
  (cons 'tr
        (for/list ([device-pair (in-list devices)])
          (define device-str (second device-pair))
          `(td ((ng-class ,(~a "elec_use."device-str".cp_class")))
               ,(handlebars (~a "elec_use."device-str".text"))))))



(module+ main
  (display-to-file
   (make-index-page
    (map xexpr->string
         (list
          (elec-use-row (take some-elec-gen-devices 4) #t)
          (elec-use-row (take (drop some-elec-gen-devices 4) 4) #f)
          (elec-use-row (take (drop some-elec-gen-devices 8) 4) #f)
          (elec-use-row (take (drop some-elec-gen-devices 12) 4) #f))))
   (build-path main "index.html")
   #:exists 'truncate))