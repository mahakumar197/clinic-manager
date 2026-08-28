export const mockZohoResponse = {
  "code": 3000,
  "fields": [
    {
      "subfields": [
        {
          "is_hidden": false,
          "column_name": "prefix",
          "display_name": "Prefix",
          "link_name": "prefix",
          "choices": [
            {
              "value": "Mr.",
              "key": "Mr."
            },
            {
              "value": "Mrs.",
              "key": "Mrs."
            },
            {
              "value": "Ms.",
              "key": "Ms."
            }
          ]
        },
        {
          "is_hidden": false,
          "column_name": "first_name",
          "display_name": "First Name",
          "link_name": "first_name"
        },
        {
          "is_hidden": false,
          "column_name": "last_name",
          "display_name": "Last Name",
          "link_name": "last_name"
        },
        {
          "is_hidden": false,
          "column_name": "suffix",
          "display_name": "Suffix",
          "link_name": "suffix"
        }
      ],
      "unique": false,
      "display_name": "Name",
      "link_name": "Name",
      "type": 29,
      "mandatory": false
    },
    {
      "unique": false,
      "max_char": 255,
      "display_name": "Email",
      "link_name": "Email",
      "type": 3,
      "mandatory": false
    },
    {
      "subfields": [
        {
          "is_hidden": false,
          "column_name": "address_line_1",
          "display_name": "Address Line 1",
          "link_name": "address_line_1"
        },
        {
          "is_hidden": false,
          "column_name": "address_line_2",
          "display_name": "Address Line 2",
          "link_name": "address_line_2"
        },
        {
          "is_hidden": false,
          "column_name": "district_city",
          "display_name": "City / District",
          "link_name": "district_city"
        },
        {
          "is_hidden": false,
          "column_name": "state_province",
          "display_name": "State / Province",
          "link_name": "state_province"
        },
        {
          "is_hidden": false,
          "column_name": "postal_code",
          "display_name": "Postal Code",
          "link_name": "postal_code"
        },
        {
          "is_hidden": false,
          "column_name": "country",
          "display_name": "Country",
          "link_name": "country"
        },
        {
          "is_hidden": true,
          "column_name": "latitude",
          "display_name": "latitude",
          "link_name": "latitude"
        },
        {
          "is_hidden": true,
          "column_name": "longitude",
          "display_name": "longitude",
          "link_name": "longitude"
        }
      ],
      "unique": false,
      "display_name": "Address",
      "link_name": "Address",
      "type": 30,
      "mandatory": false
    },
    {
      "unique": false,
      "allowed_countries": "",
      "display_name": "Phone",
      "link_name": "Phone_Number",
      "type": 27,
      "mandatory": false,
      "default_country": "us"
    },
    {
      "unique": false,
      "max_char": 255,
      "display_name": "Single Line",
      "link_name": "Single_Line",
      "type": 1,
      "mandatory": false
    },
    {
      "unique": false,
      "max_char": 200,
      "display_name": "Multi Line",
      "link_name": "Multi_Line",
      "type": 2,
      "mandatory": false
    },
    {
      "unique": false,
      "display_name": "Rich Text",
      "link_name": "Rich_Text",
      "type": 4,
      "mandatory": false
    },
    {
      "decimal_length": 0,
      "unique": false,
      "max_char": 10,
      "display_name": "Number",
      "link_name": "Number",
      "type": 5,
      "mandatory": false
    },
    {
      "decimal_length": 2,
      "unique": false,
      "max_char": 10,
      "display_name": "Decimal",
      "link_name": "Decimal",
      "type": 6,
      "mandatory": false
    },
    {
      "decimal_length": 2,
      "unique": false,
      "max_char": 10,
      "display_name": "Percent",
      "link_name": "Percent",
      "type": 7,
      "mandatory": false
    },
    {
      "decimal_length": 2,
      "currency_name": "United States Dollars",
      "currency_type": 202,
      "currency_symbol": "$",
      "unique": false,
      "currency_display": "USD",
      "max_char": 10,
      "display_name": "Currency",
      "link_name": "Currency",
      "type": 8,
      "mandatory": false,
      "number_format": 1
    },
    {
      "unique": false,
      "display_name": "Date",
      "link_name": "Date_field",
      "type": 10,
      "allowed_days": "0,1,2,3,4,5,6",
      "mandatory": false
    },
    {
      "allowed_hours": [],
      "time_display_options": "hh:mm:ss",
      "unique": false,
      "display_name": "Time",
      "link_name": "Time",
      "type": 34,
      "mins_display_interval": 1,
      "mandatory": false
    },
    {
      "allowed_hours": [],
      "time_display_options": "hh:mm:ss",
      "unique": false,
      "display_name": "Date-Time",
      "link_name": "Date_Time",
      "type": 11,
      "allowed_days": "0,1,2,3,4,5,6",
      "mins_display_interval": 1,
      "mandatory": false
    },
    {
      "unique": false,
      "display_name": "Radio",
      "link_name": "Radio",
      "type": 13,
      "choices": [
        {
          "value": "Choice 1",
          "key": "Choice 1"
        },
        {
          "value": "Choice 2",
          "key": "Choice 2"
        },
        {
          "value": "Choice 3",
          "key": "Choice 3"
        }
      ],
      "mandatory": false
    },
    {
      "unique": false,
      "display_name": "Drop Down",
      "link_name": "Dropdown",
      "type": 12,
      "choices": [
        {
          "value": "Choice 1",
          "key": "Choice 1"
        },
        {
          "value": "Choice 2",
          "key": "Choice 2"
        },
        {
          "value": "Choice 3",
          "key": "Choice 3"
        }
      ],
      "mandatory": false
    },
    {
      "unique": false,
      "display_name": "Checkbox",
      "link_name": "Checkbox",
      "type": 15,
      "choices": [
        {
          "value": "Choice 1",
          "key": "Choice 1"
        },
        {
          "value": "Choice 2",
          "key": "Choice 2"
        },
        {
          "value": "Choice 3",
          "key": "Choice 3"
        }
      ],
      "mandatory": false
    },
    {
      "unique": false,
      "display_name": "Multi Select",
      "link_name": "Multi_Select",
      "type": 14,
      "choices": [
        {
          "value": "Choice 1",
          "key": "Choice 1"
        },
        {
          "value": "Choice 2",
          "key": "Choice 2"
        },
        {
          "value": "Choice 3",
          "key": "Choice 3"
        }
      ],
      "mandatory": false
    },
    {
      "unique": false,
      "display_name": "Decision box",
      "link_name": "Decision_box",
      "type": 16,
      "mandatory": false
    },
    {
      "unique": false,
      "display_name": "Image",
      "link_name": "Image",
      "type": 18,
      "mandatory": false
    },
    {
      "unique": false,
      "display_name": "File upload",
      "link_name": "File_upload",
      "type": 19,
      "mandatory": false
    },
    {
      "unique": false,
      "display_name": "Audio",
      "link_name": "Audio",
      "type": 32,
      "mandatory": false
    },
    {
      "unique": false,
      "display_name": "Video",
      "link_name": "Video",
      "type": 33,
      "mandatory": false
    },
    {
      "unique": false,
      "display_name": "Signature",
      "link_name": "Signature",
      "type": 25,
      "mandatory": false
    },
    {
      "unique": false,
      "link_name_required": true,
      "display_name": "Url",
      "link_name": "Url",
      "type": 17,
      "mandatory": false,
      "target": 1
    },
    {
      "is_lookup_field": true,
      "unique": false,
      "display_name": "Lookup",
      "link_name": "Lookup",
      "type": 12,
      "mandatory": false
    },
    {
      "unique": false,
      "display_name": "Auto Number",
      "link_name": "Auto_Number",
      "type": 9,
      "mandatory": false
    },
    {
      "visibility": true,
      "unique": false,
      "display_name": "Formula",
      "link_name": "Formula",
      "type": 20,
      "mandatory": false
    },
    {
      "unique": false,
      "text": "Add your Note here ...",
      "display_name": "",
      "link_name": "Add_Notes",
      "type": 24,
      "mandatory": false
    },
    {
      "unique": false,
      "display_name": "Users",
      "link_name": "users",
      "type": 26,
      "mandatory": false,
      "field_select_type": 100
    },
    {
      "is_integration": true,
      "unique": false,
      "display_name": "Integration",
      "link_name": "Integration",
      "type": 31,
      "mandatory": false
    },
    {
      "decimal_length": 0,
      "zia_base_field_type": 5,
      "unique": false,
      "max_char": 10,
      "display_name": "Prediction",
      "link_name": "Prediction",
      "type": 39,
      "mandatory": false
    },
    {
      "zia_base_field_type": 2,
      "unique": false,
      "max_char": 200,
      "display_name": "Keyword",
      "link_name": "Keyword",
      "type": 37,
      "mandatory": false
    },
    {
      "zia_base_field_type": 12,
      "unique": false,
      "display_name": "Sentiment",
      "link_name": "Sentiment",
      "type": 38,
      "choices": [
        {
          "value": "Negative",
          "key": "Negative"
        },
        {
          "value": "Neutral",
          "key": "Neutral"
        },
        {
          "value": "Positive",
          "key": "Positive"
        }
      ],
      "mandatory": false
    },
    {
      "zia_base_field_type": 2,
      "unique": false,
      "max_char": 200,
      "display_name": "OCR",
      "link_name": "OCR",
      "type": 35,
      "mandatory": false
    },
    {
      "zia_base_field_type": 2,
      "unique": false,
      "max_char": 200,
      "display_name": "Object Detection",
      "link_name": "Object_Detection",
      "type": 36,
      "mandatory": false
    },
    {
      "ref_form": "ZC_SUBFORM_68",
      "unique": false,
      "display_name": "Inline SubForm",
      "link_name": "Inline_SubForm",
      "type": 21,
      "fields": [
        {
          "subfields": [
            {
              "is_hidden": true,
              "column_name": "prefix",
              "display_name": "Prefix",
              "link_name": "prefix",
              "choices": [
                {
                  "value": "Mr.",
                  "key": "Mr."
                },
                {
                  "value": "Mrs.",
                  "key": "Mrs."
                },
                {
                  "value": "Ms.",
                  "key": "Ms."
                }
              ]
            },
            {
              "is_hidden": false,
              "column_name": "first_name",
              "display_name": "First Name",
              "link_name": "first_name"
            },
            {
              "is_hidden": false,
              "column_name": "last_name",
              "display_name": "Last Name",
              "link_name": "last_name"
            },
            {
              "is_hidden": true,
              "column_name": "suffix",
              "display_name": "Suffix",
              "link_name": "suffix"
            }
          ],
          "unique": false,
          "display_name": "Name",
          "link_name": "Name",
          "type": 29,
          "mandatory": false
        },
        {
          "unique": false,
          "max_char": 255,
          "display_name": "Email",
          "link_name": "Email",
          "type": 3,
          "mandatory": false
        },
        {
          "unique": false,
          "max_char": 255,
          "display_name": "Single Line",
          "link_name": "Single_Line",
          "type": 1,
          "mandatory": false
        }
      ],
      "mandatory": false,
      "ref_application": "test-file-upload"
    },
    {
      "ref_form": "SubForm",
      "unique": false,
      "display_name": "SubForm",
      "link_name": "SubForm",
      "type": 21,
      "fields": [
        {
          "subfields": [
            {
              "is_hidden": true,
              "column_name": "prefix",
              "display_name": "Prefix",
              "link_name": "prefix",
              "choices": [
                {
                  "value": "Mr.",
                  "key": "Mr."
                },
                {
                  "value": "Mrs.",
                  "key": "Mrs."
                },
                {
                  "value": "Ms.",
                  "key": "Ms."
                }
              ]
            },
            {
              "is_hidden": false,
              "column_name": "first_name",
              "display_name": "First Name",
              "link_name": "first_name"
            },
            {
              "is_hidden": false,
              "column_name": "last_name",
              "display_name": "Last Name",
              "link_name": "last_name"
            },
            {
              "is_hidden": true,
              "column_name": "suffix",
              "display_name": "Suffix",
              "link_name": "suffix"
            }
          ],
          "unique": false,
          "display_name": "Name",
          "link_name": "Name",
          "type": 29,
          "mandatory": false
        },
        {
          "unique": false,
          "max_char": 255,
          "display_name": "Email",
          "link_name": "Email",
          "type": 3,
          "mandatory": false
        },
        {
          "unique": false,
          "max_char": 255,
          "display_name": "Single Line",
          "link_name": "Single_Line",
          "type": 1,
          "mandatory": false
        }
      ],
      "mandatory": false,
      "ref_application": "zylker-store"
    }
  ]
}