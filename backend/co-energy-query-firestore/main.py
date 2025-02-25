import functions_framework
from firebase_admin import initialize_app, firestore
from flask import jsonify

# Initialize Firebase Admin without service account (uses compute default credentials)
app = initialize_app()
db = firestore.client(app, "co-energy")

def apply_filters(query, data):
    """Apply filters to the Firestore query based on user responses."""
    print(f"Applying filters with data: {data}")
    
    # Start with essential filters
    
    # Zipcode filter if provided
    if 'zipcode' in data:
        print(f"Applying zipcode filter: {data['zipcode']}")
        query = query.where('eligible_zip_codes', 'array_contains', data['zipcode'])
    
    # Filter by owner status (Q2)
    if 'Q2' in data:
        print(f"Applying owner status filter: Q2 = {data['Q2']}")
        if data['Q2'] == 'a':  # I own my home
            # Return programs that either:
            # 1. Have no owner_status restrictions (null/empty array)
            # 2. Support homeowners only
            # 3. Support both homeowners and renters
            query = query.where('owner_status', 'in', [None, [], ['homeowner'], ['homeowner', 'renter'], ['renter', 'homeowner']])
        elif data['Q2'] == 'b':  # I rent my home
            # Return programs that either:
            # 1. Have no owner_status restrictions (null/empty array)
            # 2. Support renters only
            # 3. Support both homeowners and renters
            query = query.where('owner_status', 'in', [None, [], ['renter'], ['homeowner', 'renter'], ['renter', 'homeowner']])
        # For 'c' (Other) and 'd' (Not applicable), we don't apply owner_status filter
    
    # Filter by income qualification (Q8, Q9)
    if 'Q8' in data and data['Q8'] == 'a':
        print("Applying income filter: User wants assistance programs")
        # User wants assistance programs - low income check only
        query = query.where('low_income', '!=', None)
    elif 'Q9' in data and data['Q9'] == 'b':
        print("Applying income filter: User is not low-income")
        # User is not low-income, exclude programs that ONLY have low_income requirements
        query = query.where('low_income', 'in', [None, False])
    
    # Payment method exclusions moved to post-processing to avoid multiple '!=' operators
    print("Payment method exclusions will be handled in post-processing")
    
    # Exclusive filters (narrow down results):
    # - Zipcode (must be in eligible_zip_codes)
    # - Owner status (must match user's status)
    # - Income qualification (must be income-qualified if user wants assistance programs)
    
    # Inclusive filters (add more possibilities):
    # - Items/upgrades (Q3) - any matching item makes a program eligible
    # - Payment methods (Q4-Q7) - any matching payment method makes a program eligible
    # - Conditional questions (Q10-Q13) - any matching answer makes a program eligible
    
    # Q10-Q13 filters moved to post-query filtering due to 'in' operator limit
    
    return query

def should_include_program(program, filters):
    """Determine if a program should be included based on array-based filters."""
    print(f"Checking program inclusion for filters: {filters}")
    
    # Q3: Check if program's Q3 value is in the user's selected options
    if 'Q3' in filters and isinstance(filters['Q3'], list):
        program_q3 = program.get('answers', {}).get('Q3')
        if program_q3:
            if isinstance(program_q3, list):
                if not any(item in filters['Q3'] for item in program_q3):
                    print(f"Excluding program: no matching Q3 options found. User selected: {filters['Q3']}, Program Q3: {program_q3}")
                    return False
            elif program_q3 not in filters['Q3']:
                print(f"Excluding program: Q3 option not in user's selection. User selected: {filters['Q3']}, Program Q3: {program_q3}")
                return False
        else:
            print(f"Excluding program: no Q3 value found in program")
            return False
    
    # Handle all payment method exclusions in post-processing
    payment_exclusions = []
    if 'Q4' in filters and filters['Q4'] == 'b':
        payment_exclusions.append('pos_rebate')
    if 'Q5' in filters and filters['Q5'] == 'b':
        payment_exclusions.append('rebate')
    if 'Q6' in filters and filters['Q6'] == 'b':
        payment_exclusions.append('account_credit')
    if 'Q7' in filters and filters['Q7'] == 'b':
        payment_exclusions.append('tax_credit')
    
    if payment_exclusions:
        program_methods = program.get('payment_methods', [])
        for method in payment_exclusions:
            if program_methods == [method]:  # Only exclude if this is the only payment method
                print(f"Excluding program: only has excluded payment method {method}")
                return False
    
    # Q8: Check for assistance program in payment methods
    if 'Q8' in filters and filters['Q8'] == 'a':
        payment_methods = program.get('payment_methods', [])
        if 'assistance_program' not in payment_methods:
            print("Excluding program: missing assistance_program payment method")
            return False
    
    # Q10: Check heat pump types
    if 'Q10' in filters and isinstance(filters['Q10'], list) and filters['Q10']:
        if 'Q10' in program.get('answers', {}):
            program_types = program['answers']['Q10']
            if not any(t in program_types for t in filters['Q10']):
                print(f"Excluding program: no matching heat pump types. Selected: {filters['Q10']}, Program: {program_types}")
                return False
        else:
            print("Including program: Q10 not present in program")

    # Q11: Check EV charger type
    if 'Q11' in filters and filters['Q11']:
        if 'Q11' in program.get('answers', {}):
            program_types = program['answers']['Q11']
            if filters['Q11'] not in program_types:
                print(f"Excluding program: no matching EV charger type. Selected: {filters['Q11']}, Program: {program_types}")
                return False
        else:
            print("Including program: Q11 not present in program")

    # Q12: Check e-bike type
    if 'Q12' in filters and filters['Q12']:
        if 'Q12' in program.get('answers', {}):
            program_types = program['answers']['Q12']
            if filters['Q12'] not in program_types:
                print(f"Excluding program: no matching e-bike type. Selected: {filters['Q12']}, Program: {program_types}")
                return False
        else:
            print("Including program: Q12 not present in program")

    # Q13: Check outdoor equipment types
    if 'Q13' in filters and isinstance(filters['Q13'], list) and filters['Q13']:
        if 'Q13' in program.get('answers', {}):
            program_types = program['answers']['Q13']
            if not any(t in program_types for t in filters['Q13']):
                print(f"Excluding program: no matching outdoor equipment types. Selected: {filters['Q13']}, Program: {program_types}")
                return False
        else:
            print("Including program: Q13 not present in program")
    
    print("Program passed all inclusion criteria")
    return True

def process_results(results, data):
    """Process query results to return summary and program details."""
    print("Starting to process results")
    programs = []
    total_amount = 0
    excluded_count = 0
    
    try:
        print("Converting stream to list...")
        results_list = list(results)  # Convert stream to list to check if empty
        print(f"Found {len(results_list)} documents before post-processing")
        
        for doc in results_list:
            doc_data = doc.to_dict()
            print(f"\nProcessing document {doc.id}")
            
            # Post-query filtering for array-based conditions
            if not should_include_program(doc_data, data):
                excluded_count += 1
                continue
            
            print(f"Including document {doc.id} in results")
            
            # Get amount, defaulting to 0 if both amount fields are None
            amount_max = doc_data.get('amount_maximum')
            amount_num = doc_data.get('amount_number')
            amount = amount_max if amount_max is not None else (amount_num if amount_num is not None else 0)
            
            programs.append({
                'id': doc.id,
                'short_description_en': doc_data.get('short_description_en', ''),
                'short_description_es': doc_data.get('short_description_es', ''),
                'amount': amount
            })
            
            # Only add to total if amount is a number
            if isinstance(amount, (int, float)):
                total_amount += amount
                print(f"Added amount {amount} to total")
        
        print(f"\nPost-processing summary:")
        print(f"- Total documents found: {len(results_list)}")
        print(f"- Documents excluded: {excluded_count}")
        print(f"- Documents included: {len(programs)}")
        print(f"- Total potential amount: {total_amount}")
        
        result = {
            'opportunities_count': len(programs),
            'total_potential': total_amount,
            'programs': programs
        }
        
        # If no results found, add diagnostic information
        if len(programs) == 0:
            print("No programs found after filtering. Adding diagnostic information.")
            result['diagnostic'] = {
                'total_documents': len(results_list),
                'excluded_count': excluded_count,
                'applied_filters': data
            }
        
        return result
        
    except Exception as e:
        print(f"Error processing results: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise  # Re-raise the exception to be caught by the outer try-except

@functions_framework.http
def query_incentives(request):
    """HTTP Cloud Function to query incentives based on user responses."""
    # Set CORS headers for the preflight request
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)

    # Set CORS headers for the main request
    headers = {
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        # Get request data
        request_data = request.get_json()
        print(f"Received request data: {request_data}")
        
        if not request_data:
            return (jsonify({'error': 'No data provided'}), 400, headers)
        
        # Build and execute query
        query = db.collection('incentives')
        query = apply_filters(query, request_data)
        print("Query built, streaming results...")
        results = query.stream()
        
        # Process and return results with post-query filtering
        processed_results = process_results(results, request_data)
        print(f"Successfully processed results: {processed_results}")
        return (jsonify(processed_results), 200, headers)
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return (jsonify({'error': str(e)}), 500, headers)
