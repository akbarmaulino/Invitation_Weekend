// js/invitation-utils.js
// Utility functions untuk Trip Invitation System

import { supabase } from './supabaseClient.js';

// ============================================================
// TOKEN GENERATION
// ============================================================

/**
 * Generate random token untuk invitation link
 * @returns {string} Random token (12 characters, URL-safe)
 */
export function generateInvitationToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 12; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

/**
 * Calculate expiry date (default: 30 days from now)
 * @param {number} days - Number of days until expiry
 * @returns {string} ISO timestamp
 */
export function calculateExpiryDate(days = 30) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
}

// ============================================================
// CREATE INVITATION
// ============================================================

/**
 * Create new trip invitation
 * @param {Object} params - Invitation parameters
 * @param {string} params.tripId - Trip ID (uuid)
 * @param {string} params.inviterName - Nama yang ngundang
 * @param {string} params.invitedEmail - Email yang diundang (optional)
 * @param {string} params.message - Custom message (optional)
 * @param {number} params.maxUses - Max usage count (default: 1)
 * @param {number} params.expiryDays - Days until expiry (default: 30)
 * @returns {Promise<Object>} { success, token, invitationUrl, error }
 */
export async function createTripInvitation({
    tripId,
    inviterName,
    invitedEmail = null,
    message = null,
    maxUses = 1,
    expiryDays = 30
}) {
    try {
        // Generate unique token
        let token = generateInvitationToken();
        let isUnique = false;
        let attempts = 0;
        
        // Ensure token is unique (max 5 attempts)
        while (!isUnique && attempts < 5) {
            const { data: existing } = await supabase
                .from('trip_invitations')
                .select('id')
                .eq('token', token)
                .single();
            
            if (!existing) {
                isUnique = true;
            } else {
                token = generateInvitationToken();
                attempts++;
            }
        }
        
        if (!isUnique) {
            throw new Error('Failed to generate unique token');
        }
        
        // Calculate expiry
        const expiresAt = calculateExpiryDate(expiryDays);
        
        // Insert invitation
        const { data: invitation, error } = await supabase
            .from('trip_invitations')
            .insert([{
                trip_id: tripId,
                token: token,
                invited_email: invitedEmail,
                inviter_name: inviterName,
                invitation_message: message,
                expires_at: expiresAt,
                max_uses: maxUses,
                status: 'pending'
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        // ✅ FIX: Use production URL
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
        
        const baseUrl = isLocalhost 
            ? window.location.origin  // Use localhost for testing
            : 'https://invitation-weekend.vercel.app';  // ✅ Production URL
        
        const invitationUrl = `${baseUrl}/review-invitation.html?token=${token}`;
        
        console.log('✅ Invitation created:', {
            token,
            url: invitationUrl,
            environment: isLocalhost ? 'localhost' : 'production'
        });
        
        return {
            success: true,
            token: token,
            invitationUrl: invitationUrl,
            invitation: invitation
        };
        
    } catch (error) {
        console.error('Error creating invitation:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ============================================================
// VALIDATE INVITATION
// ============================================================

/**
 * Validate invitation token
 * @param {string} token - Invitation token
 * @returns {Promise<Object>} { valid, invitation, trip, error }
 */
export async function validateInvitationToken(token) {
    try {
        // Fetch invitation
        const { data: invitation, error: invitationError } = await supabase
            .from('trip_invitations')
            .select('*')
            .eq('token', token)
            .single();
        
        if (invitationError || !invitation) {
            return {
                valid: false,
                error: 'Invalid invitation link'
            };
        }
        
        // Check status
        if (invitation.status === 'expired') {
            return {
                valid: false,
                error: 'This invitation has expired'
            };
        }
        
        // Check expiry date
        const now = new Date();
        const expiresAt = new Date(invitation.expires_at);
        
        if (now > expiresAt) {
            // Mark as expired
            await supabase
                .from('trip_invitations')
                .update({ status: 'expired' })
                .eq('id', invitation.id);
            
            return {
                valid: false,
                error: 'This invitation has expired'
            };
        }
        
        // Check max uses
        if (invitation.use_count >= invitation.max_uses) {
            return {
                valid: false,
                error: 'This invitation has reached maximum uses'
            };
        }
        
        // Fetch trip details
        const { data: trip, error: tripError } = await supabase
            .from('trip_history')
            .select('*')
            .eq('id', invitation.trip_id)
            .single();
        
        if (tripError || !trip) {
            return {
                valid: false,
                error: 'Trip not found'
            };
        }
        
        return {
            valid: true,
            invitation: invitation,
            trip: trip
        };
        
    } catch (error) {
        console.error('Error validating token:', error);
        return {
            valid: false,
            error: error.message
        };
    }
}

// ============================================================
// INCREMENT USE COUNT
// ============================================================

/**
 * Increment use count when someone uses the invitation
 * @param {string} invitationId - Invitation ID
 * @returns {Promise<boolean>} Success status
 */
export async function incrementInvitationUse(invitationId) {
    try {
        // Get current invitation
        const { data: invitation, error: fetchError } = await supabase
            .from('trip_invitations')
            .select('use_count, max_uses')
            .eq('id', invitationId)
            .single();
        
        if (fetchError) throw fetchError;
        
        const newUseCount = invitation.use_count + 1;
        const newStatus = newUseCount >= invitation.max_uses ? 'used' : 'pending';
        
        // Update invitation
        const { error: updateError } = await supabase
            .from('trip_invitations')
            .update({
                use_count: newUseCount,
                status: newStatus,
                used_at: new Date().toISOString()
            })
            .eq('id', invitationId);
        
        if (updateError) throw updateError;
        
        return true;
        
    } catch (error) {
        console.error('Error incrementing use count:', error);
        return false;
    }
}

// ============================================================
// GET INVITATION STATS
// ============================================================

/**
 * Get invitation statistics for a trip
 * @param {string} tripId - Trip ID
 * @returns {Promise<Object>} Stats object
 */
export async function getTripInvitationStats(tripId) {
    try {
        const { data: invitations, error } = await supabase
            .from('trip_invitations')
            .select('*')
            .eq('trip_id', tripId);
        
        if (error) throw error;
        
        const stats = {
            total: invitations.length,
            pending: invitations.filter(i => i.status === 'pending').length,
            used: invitations.filter(i => i.status === 'used').length,
            expired: invitations.filter(i => i.status === 'expired').length,
            totalUses: invitations.reduce((sum, i) => sum + i.use_count, 0)
        };
        
        return stats;
        
    } catch (error) {
        console.error('Error fetching invitation stats:', error);
        return null;
    }
}