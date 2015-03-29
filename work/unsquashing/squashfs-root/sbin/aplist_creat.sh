#!/bin/sh
iwpriv ra0 set SiteSurvey=1
sleep 3
iwpriv ra0 get_site_survey > /tmp/ap_list.out



