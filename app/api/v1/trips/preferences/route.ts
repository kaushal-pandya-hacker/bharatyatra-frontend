import { NextRequest, NextResponse } from 'next/server';
import { universalPreferenceManager } from '@/lib/ai-planner/preference-manager-service';
import { parseNaturalLanguagePreferenceCommand } from '@/lib/ai-planner/nl-preference-parser';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json(
        { success: false, error: 'Query parameter profileId is required.' },
        { status: 400 }
      );
    }

    const profile = universalPreferenceManager.getProfile(profileId);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: `Preference profile '${profileId}' not found.` },
        { status: 404 }
      );
    }

    const plan = universalPreferenceManager.getActivePlan(profileId);
    const history = universalPreferenceManager.getHistory(profileId);

    return NextResponse.json({
      success: true,
      data: {
        profile,
        plan,
        history,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch preferences.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'UPDATE';

    switch (action) {
      case 'CREATE': {
        const { profile, plan } = await universalPreferenceManager.createProfile(body.initialData);
        return NextResponse.json({
          success: true,
          data: { profile, plan },
        });
      }

      case 'UPDATE': {
        if (!body.profileId) {
          return NextResponse.json(
            { success: false, error: 'profileId is required for UPDATE action.' },
            { status: 400 }
          );
        }
        const result = await universalPreferenceManager.updatePreferences(
          body.profileId,
          body.patch || {},
          {
            forceOverrideLocks: body.forceOverrideLocks,
            customReason: body.customReason,
          }
        );

        return NextResponse.json({
          success: result.success,
          data: result,
        }, { status: result.success ? 200 : 409 });
      }

      case 'LOCK': {
        if (!body.profileId || !body.path) {
          return NextResponse.json(
            { success: false, error: 'profileId and path are required for LOCK action.' },
            { status: 400 }
          );
        }
        const profile = universalPreferenceManager.lockPreference(body.profileId, body.path);
        return NextResponse.json({ success: true, data: { profile } });
      }

      case 'UNLOCK': {
        if (!body.profileId || !body.path) {
          return NextResponse.json(
            { success: false, error: 'profileId and path are required for UNLOCK action.' },
            { status: 400 }
          );
        }
        const profile = universalPreferenceManager.unlockPreference(body.profileId, body.path);
        return NextResponse.json({ success: true, data: { profile } });
      }

      case 'UNDO': {
        if (!body.profileId) {
          return NextResponse.json(
            { success: false, error: 'profileId is required for UNDO action.' },
            { status: 400 }
          );
        }
        const result = await universalPreferenceManager.undoRecentChange(body.profileId);
        return NextResponse.json({ success: true, data: result });
      }

      case 'RESTORE': {
        if (!body.profileId || typeof body.version !== 'number') {
          return NextResponse.json(
            { success: false, error: 'profileId and version (number) are required for RESTORE action.' },
            { status: 400 }
          );
        }
        const result = await universalPreferenceManager.restoreVersion(body.profileId, body.version);
        return NextResponse.json({ success: true, data: result });
      }

      case 'COMPARE': {
        if (!body.profileId || typeof body.versionA !== 'number' || typeof body.versionB !== 'number') {
          return NextResponse.json(
            { success: false, error: 'profileId, versionA, and versionB are required for COMPARE action.' },
            { status: 400 }
          );
        }
        const comparison = universalPreferenceManager.compareVersions(
          body.profileId,
          body.versionA,
          body.versionB
        );
        return NextResponse.json({ success: true, data: comparison });
      }

      case 'NL_COMMAND': {
        if (!body.profileId || !body.command) {
          return NextResponse.json(
            { success: false, error: 'profileId and command are required for NL_COMMAND action.' },
            { status: 400 }
          );
        }
        const profile = universalPreferenceManager.getProfile(body.profileId);
        if (!profile) {
          return NextResponse.json(
            { success: false, error: `Profile ${body.profileId} not found.` },
            { status: 404 }
          );
        }
        const nlParsed = parseNaturalLanguagePreferenceCommand(body.command, profile);
        if (!nlParsed.understood) {
          return NextResponse.json({
            success: false,
            error: nlParsed.actionSummary,
            clarificationNeeded: nlParsed.clarificationNeeded,
          }, { status: 422 });
        }
        const result = await universalPreferenceManager.updatePreferences(
          body.profileId,
          nlParsed.patch,
          {
            forceOverrideLocks: body.forceOverrideLocks,
            customReason: nlParsed.actionSummary,
          }
        );
        return NextResponse.json({
          success: result.success,
          data: {
            ...result,
            commandSummary: nlParsed.actionSummary,
          },
        }, { status: result.success ? 200 : 409 });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unsupported action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Preference engine operation failed.' },
      { status: 500 }
    );
  }
}
